import { QueryTypes, Transaction } from 'sequelize';
import { sequelize, Order, OrderItem, Product } from '../../db/models';
import { TAX_RATE } from '@ecomm/shared';
import type { CheckoutInput, OrderDTO } from '@ecomm/shared';
import { AppError } from '../../utils/AppError';

export class OrdersService {

  async createOrder(userId: number, input: CheckoutInput, idempotencyKey?: string): Promise<OrderDTO> {
    const { items, shippingAddress } = input;

    if (!items || items.length === 0) {
      throw new AppError(400, 'Order must contain at least one item');
    }

    // Consolidate duplicate product entries if client passed any
    const consolidatedMap = new Map<number, number>();
    for (const item of items) {
      const current = consolidatedMap.get(item.productId) || 0;
      consolidatedMap.set(item.productId, current + item.quantity);
    }
    const consolidatedItems = Array.from(consolidatedMap.entries()).map(
      ([productId, quantity]) => ({ productId, quantity })
    );

    return await sequelize.transaction(async (t) => {
      if (idempotencyKey) {
        const claimed = await sequelize.query<{ id: number }>(
          `INSERT INTO idempotency_keys ("userId", "key")
           VALUES (:userId, :key)
           ON CONFLICT ("userId", "key") DO NOTHING
           RETURNING id`,
          {
            replacements: { userId, key: idempotencyKey },
            type: QueryTypes.SELECT,
            transaction: t,
          }
        );

        if (claimed.length === 0) {
          // Key already used and committed: return the original order, touch nothing else
          const [row] = await sequelize.query<{ orderId: number | null }>(
            `SELECT "orderId" FROM idempotency_keys WHERE "userId" = :userId AND "key" = :key`,
            {
              replacements: { userId, key: idempotencyKey },
              type: QueryTypes.SELECT,
              transaction: t,
            }
          );
          if (!row || row.orderId === null) {
            throw new AppError(409, 'Order is still being processed. Please retry shortly.');
          }
          return this.loadFullOrder(row.orderId, t);
        }
      }

      // Step 1: Sort product IDs ascending ([1, 4, 9]) to prevent deadlocks
      const sortedIds = consolidatedItems.map((i) => i.productId).sort((a, b) => a - b);

      // Step 2: Fetch products with row-level lock
      const products = await Product.findAll({
        where: { id: sortedIds },
        order: [['id', 'ASC']],
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      const productMap = new Map<number, Product>();
      products.forEach((p) => productMap.set(p.id, p));

      // Step 3: Validate inventory
      for (const item of consolidatedItems) {
        const product = productMap.get(item.productId);
        if (!product || product.stock < item.quantity) {
          throw new AppError(
            409,
            `Insufficient stock for product ${product ? product.title : item.productId}`
          );
        }
      }

      // Step 4: Calculate financials using DB prices
      const subtotal =
        Math.round(
          consolidatedItems.reduce((sum, item) => {
            const product = productMap.get(item.productId)!;
            return sum + Number(product.price) * item.quantity;
          }, 0) * 100
        ) / 100;

      const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      // Step 5: Insert Order record with shipping address snapshot
      const order = await Order.create(
        {
          userId,
          status: 'pending',
          subtotal,
          tax,
          total,
          shippingAddress,
        },
        { transaction: t }
      );

      // Step 6: Bulk insert OrderItems (snapshotting current unitPrice)
      const orderItemsData = consolidatedItems.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Number(product.price),
        };
      });
      await OrderItem.bulkCreate(orderItemsData, { transaction: t });

      // Step 7: Decrement product stock
      for (const item of consolidatedItems) {
        const product = productMap.get(item.productId)!;
        await product.decrement('stock', {
          by: item.quantity,
          transaction: t,
        });
      }

      // Step 8: Link the idempotency key to the order (same transaction)
      if (idempotencyKey) {
        await sequelize.query(
          `UPDATE idempotency_keys SET "orderId" = :orderId
           WHERE "userId" = :userId AND "key" = :key`,
          {
            replacements: { orderId: order.id, userId, key: idempotencyKey },
            transaction: t,
          }
        );
      }

      // Step 9: Return the full order; everything commits when this callback resolves
      return this.loadFullOrder(order.id, t);
    });
  }

  private async loadFullOrder(orderId: number, t?: Transaction): Promise<OrderDTO> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      transaction: t,
    });

    return order!.toJSON() as unknown as OrderDTO;
  }

  async getOrderById(orderId: number, userId: number, role: string): Promise<OrderDTO> {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    if (!order) {
      throw new AppError(404, `Order #${orderId} not found`);
    }

    if (role !== 'admin' && order.userId !== userId) {
      throw new AppError(403, 'Access forbidden');
    }

    return order.toJSON() as unknown as OrderDTO;
  }

  async getUserOrders(userId: number): Promise<OrderDTO[]> {
    const orders = await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }],
        },
      ],
    });

    return orders.map((o) => o.toJSON() as unknown as OrderDTO);
  }
}

export const ordersService = new OrdersService();