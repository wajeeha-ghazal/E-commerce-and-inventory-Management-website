import { Op } from 'sequelize';
import { Product, Order, User } from '../../../db/models';
import { ORDER_STATUSES, OrderStatus, AdminStatsDTO } from '@ecomm/shared';

export const adminStatsService = {
  /**
   * Aggregate store statistics: inventory, orders, revenue, and users.
   */
  async getStats(): Promise<AdminStatsDTO> {
    // Inventory stats
    const totalUnitsRaw = await Product.sum('stock', { where: { deletedAt: null } });
    const totalUnits = totalUnitsRaw || 0;
    const distinctProducts = await Product.count({ where: { deletedAt: null } });
    const lowStockCount = await Product.count({
      where: {
        deletedAt: null,
        stock: { [Op.gt]: 0, [Op.lte]: 5 },
      },
    });
    const outOfStockCount = await Product.count({
      where: {
        deletedAt: null,
        stock: 0,
      },
    });

    // Orders stats & revenue (excluding cancelled orders for revenue)
    const totalRevenueRaw = await Order.sum('total', {
      where: { status: { [Op.ne]: 'cancelled' } },
    });
    const totalRevenue = Math.round((Number(totalRevenueRaw) || 0) * 100) / 100;
    const totalOrders = await Order.count();

    const byStatus = {} as Record<OrderStatus, number>;
    for (const status of ORDER_STATUSES) {
      byStatus[status] = await Order.count({ where: { status } });
    }

    // Users stats
    const totalUsers = await User.count();
    const customerCount = await User.count({ where: { role: 'customer' } });
    const adminCount = await User.count({
      where: { role: { [Op.in]: ['admin', 'super_admin'] } },
    });

    return {
      inventory: {
        totalUnits,
        distinctProducts,
        lowStockCount,
        outOfStockCount,
      },
      orders: {
        totalRevenue,
        totalOrders,
        byStatus,
      },
      users: {
        totalUsers,
        customerCount,
        adminCount,
      },
    };
  },
};
