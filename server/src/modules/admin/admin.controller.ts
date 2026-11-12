import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { OrderStatus, UserRole } from '@ecomm/shared';

export const adminController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  }),

  // Products
  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const includeDeleted = req.query['includeDeleted'] === 'true';
    const data = await adminService.getProducts(includeDeleted);
    res.json({ success: true, data });
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.createProduct(req.body);
    res.status(201).json({ success: true, data });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await adminService.updateProduct(id, req.body);
    res.json({ success: true, data });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await adminService.deleteProduct(id);
    res.json({ success: true, data, message: 'Product soft-deleted successfully' });
  }),

  restoreProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await adminService.restoreProduct(id);
    res.json({ success: true, data, message: 'Product restored successfully' });
  }),

  // Categories
  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getCategories();
    res.json({ success: true, data });
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const data = await adminService.createCategory(req.body);
    res.status(201).json({ success: true, data });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await adminService.updateCategory(id, req.body);
    res.json({ success: true, data });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await adminService.deleteCategory(id);
    res.json({ success: true, data });
  }),

  // Orders
  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query['status'] as OrderStatus | undefined;
    const data = await adminService.getOrders(status);
    res.json({ success: true, data });
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const { status } = req.body;
    const data = await adminService.updateOrderStatus(id, status);
    res.json({ success: true, data });
  }),

  // Users
  getUsers: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getUsers();
    res.json({ success: true, data });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const { role } = req.body;
    const data = await adminService.updateUserRole(id, role as UserRole);
    res.json({ success: true, data });
  }),
};
