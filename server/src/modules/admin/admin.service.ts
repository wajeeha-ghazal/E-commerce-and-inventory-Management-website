import { adminStatsService } from './services/admin.stats.service';
import { adminProductsService } from './services/admin.products.service';
import { adminCategoriesService } from './services/admin.categories.service';
import { adminOrdersService } from './services/admin.orders.service';
import { adminUsersService } from './services/admin.users.service';

export const adminService = {
  ...adminStatsService,
  ...adminProductsService,
  ...adminCategoriesService,
  ...adminOrdersService,
  ...adminUsersService,
};

export default adminService;
