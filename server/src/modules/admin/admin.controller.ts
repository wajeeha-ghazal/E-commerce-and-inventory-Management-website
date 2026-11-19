import { Request, Response } from 'express';
import { adminService } from './admin.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { OrderStatus, UserRole } from '@ecomm/shared';
import { CurrentUser } from './types';

export const adminController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  }),

  // Products
  getProducts: asyncHandler(async (req: Request, res: Response) => {
    const includeDeleted = req.query['includeDeleted'] === 'true';
    const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const data = await adminService.getProducts({ includeDeleted, page, limit });
    res.json({ success: true, data });
  }),

  createProduct: asyncHandler(async (req: Request, res: Response) => {
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.createProduct(req.body, currentUser);
    res.status(201).json({ success: true, data });
  }),

  updateProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.updateProduct(id, req.body, currentUser);
    res.json({ success: true, data });
  }),

  deleteProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.deleteProduct(id, currentUser);
    res.json({ success: true, data, message: 'Product soft-deleted successfully' });
  }),

  restoreProduct: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.restoreProduct(id, currentUser);
    res.json({ success: true, data, message: 'Product restored successfully' });
  }),

  // Categories
  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const includeDeleted = req.query['includeDeleted'] === 'true';
    const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const data = await adminService.getCategories({ includeDeleted, page, limit });
    res.json({ success: true, data });
  }),

  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.createCategory(req.body, currentUser);
    res.status(201).json({ success: true, data });
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.updateCategory(id, req.body, currentUser);
    res.json({ success: true, data });
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.deleteCategory(id, currentUser);
    res.json({ success: true, data, message: 'Category soft-deleted successfully' });
  }),

  restoreCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.restoreCategory(id, currentUser);
    res.json({ success: true, data, message: 'Category restored successfully' });
  }),

  // Orders
  getOrders: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query['status'] as OrderStatus | undefined;
    const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const data = await adminService.getOrders({ status, page, limit });
    res.json({ success: true, data });
  }),

  updateOrderStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const { status } = req.body;
    const data = await adminService.updateOrderStatus(id, status);
    res.json({ success: true, data });
  }),

  // Users
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const page = req.query['page'] ? parseInt(req.query['page'] as string, 10) : undefined;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const data = await adminService.getUsers({ page, limit });
    res.json({ success: true, data });
  }),

  updateUserRole: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const currentUser: CurrentUser = { id: req.user!.id, role: req.user!.role };
    const data = await adminService.updateUserRole(id, req.body.role as UserRole, currentUser);
    res.json({ success: true, data });
  }),
};
