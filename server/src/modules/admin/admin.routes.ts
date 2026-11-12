import { Router } from 'express';
import { adminController } from './admin.controller';
import {
  createProductValidator,
  updateProductValidator,
  createCategoryValidator,
  updateCategoryValidator,
  updateOrderStatusValidator,
  updateUserRoleValidator,
} from './admin.validator';
import { validate } from '../../middleware/validate';
import { authenticateJwt } from '../../middleware/authenticate';
import { authorizeRoles } from '../../middleware/authorize';

const router = Router();

// Enforce authentication & Admin RBAC on all admin endpoints (403 Forbidden for non-admins)
router.use(authenticateJwt);
router.use(authorizeRoles('admin'));

// 1. Dashboard Stats
router.get('/stats', adminController.getStats);

// 2. Product Management (CRUD + Soft Deletion + Restore)
router.get('/products', adminController.getProducts);
router.post('/products', createProductValidator, validate, adminController.createProduct);
router.put('/products/:id', updateProductValidator, validate, adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.patch('/products/:id/restore', adminController.restoreProduct);

// 3. Category Management
router.get('/categories', adminController.getCategories);
router.post('/categories', createCategoryValidator, validate, adminController.createCategory);
router.put('/categories/:id', updateCategoryValidator, validate, adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// 4. Global Order Management
router.get('/orders', adminController.getOrders);
router.patch(
  '/orders/:id/status',
  updateOrderStatusValidator,
  validate,
  adminController.updateOrderStatus
);

// 5. User Management
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', updateUserRoleValidator, validate, adminController.updateUserRole);

export default router;
