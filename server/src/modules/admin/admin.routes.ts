import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticateJwt } from '../../middleware/authenticate';
import { authorizeRoles } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createProductValidator,
  updateProductValidator,
  createCategoryValidator,
  updateCategoryValidator,
  updateOrderStatusValidator,
  updateUserRoleValidator,
} from './admin.validator';

const router = Router();

// Base Gate: Requires authentication & admin privileges
router.use(authenticateJwt);
router.use(authorizeRoles('admin', 'super_admin'));

// 1. Dashboard Stats
router.get('/stats', adminController.getStats);

// 2. Product Management (Ownership verified in service)
router.get('/products', adminController.getProducts);
router.post('/products', createProductValidator, validate, adminController.createProduct);
router.put('/products/:id', updateProductValidator, validate, adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/restore', adminController.restoreProduct);

// 3. Category Management (Ownership verified in service)
router.get('/categories', adminController.getCategories);
router.post('/categories', createCategoryValidator, validate, adminController.createCategory);
router.put('/categories/:id', updateCategoryValidator, validate, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.patch('/categories/:id/restore', adminController.restoreCategory);

// 4. Global Order Management
router.get('/orders', adminController.getOrders);
router.patch(
  '/orders/:id/status',
  updateOrderStatusValidator,
  validate,
  adminController.updateOrderStatus
);

// 5. User Management (SUPER ADMIN ONLY)
router.get('/users', authorizeRoles('super_admin'), adminController.getUsers);
router.patch(
  '/users/:id/role',
  authorizeRoles('super_admin'),
  updateUserRoleValidator,
  validate,
  adminController.updateUserRole
);

export default router;
