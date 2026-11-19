import { Product, Order, OrderItem, User, Profile } from '../../../db/models';
import { ORDER_STATUSES, OrderStatus } from '@ecomm/shared';
import { AppError } from '../../../utils/AppError';

export const adminOrdersService = {
  async getOrders(params?: OrderStatus | { status?: OrderStatus; page?: number; limit?: number }) {
    const isStatusString = typeof params === 'string';
    const status = isStatusString ? params : params?.status;
    const page = !isStatusString && params?.page ? Math.max(1, Number(params.page)) : undefined;
    const limit = !isStatusString && params?.limit ? Math.max(1, Number(params.limit)) : undefined;
    const whereClause = status ? { status } : {};

    const include = [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            paranoid: false,
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'],
        include: [{ model: Profile, as: 'profile' }],
      },
    ];

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Order.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        include,
        limit: l,
        offset,
        distinct: true,
      });

      return {
        items: rows,
        total: count,
        page: p,
        limit: l,
        totalPages: Math.ceil(count / l),
      };
    }

    return await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include,
    });
  },

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`);
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError(404, `Order #${orderId} not found`);
    }

    order.status = status;
    await order.save();

    return await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', paranoid: false }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });
  },
};
