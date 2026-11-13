import { sequelize, Order, OrderItem, Product } from '../../db/models';
import { TAX_RATE } from '@ecomm/shared';
import type { CheckoutInput, OrderDTO } from '@ecomm/shared';
import { AppError } from '../../utils/AppError';

interface IdempotencyEntry {
  promise?: Promise<OrderDTO>;
  response?: OrderDTO;
  createdAt: number;
}

const idempotencyCache = new Map<string, IdempotencyEntry>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Periodic cleanup of expired idempotency entries
setInterval(() => {
  const cutoff = Date.now() - IDEMPOTENCY_TTL_MS;
  for (const [key, entry] of idempotencyCache.entries()) {
    if (entry.createdAt < cutoff) {
      idempotencyCache.delete(key);
    }
  }
}, 60 * 1000).unref();

export class OrdersService {
  /**
   * Creates an order within a managed transaction.
   * Row locks products in ascending ID order to prevent deadlocks under concurrent requests.
   */
  async createOrder(
    userId: number,
    input: CheckoutInput,
    idempotencyKey?: string
  ): Promise<OrderDTO> {
    if (idempotencyKey) {
      const cacheKey = `${userId}:${idempotencyKey}`;
      const existing = idempotencyCache.get(cacheKey);
      if (existing) {
        if (existing.response) {
          return existing.response;
        }
        if (existing.promise) {
          return await existing.promise;
        }
      }

      const execPromise = this.executeOrderTransaction(userId, input);
      idempotencyCache.set(cacheKey, {
        promise: execPromise,
        createdAt: Date.now(),
      });

      try {
        const order = await execPromise;
        const entry = idempotencyCache.get(cacheKey);
        if (entry) {
          entry.response = order;
          delete entry.promise;
        }
        return order;
      } catch (err) {
        idempotencyCache.delete(cacheKey);
        throw err;
      }
    }

    return this.executeOrderTransaction(userId, input);
  }

  private async executeOrderTransaction(userId: number, input: CheckoutInput): Promise<OrderDTO> {
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

      // Step 8: Commit transaction. Return newly created order.
      const fullOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Product, as: 'product' }],
          },
        ],
        transaction: t,
      });

      return fullOrder!.toJSON() as unknown as OrderDTO;
    });
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
