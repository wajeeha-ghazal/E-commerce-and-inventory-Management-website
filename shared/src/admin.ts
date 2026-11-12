import { OrderStatus } from './constants';

export interface AdminStatsDTO {
  inventory: {
    totalUnits: number;
    distinctProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  orders: {
    totalRevenue: number;
    totalOrders: number;
    byStatus: Record<OrderStatus, number>;
  };
  users: {
    totalUsers: number;
    customerCount: number;
    adminCount: number;
  };
}
