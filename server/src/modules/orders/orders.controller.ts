import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const ordersController = {
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      (req.body.idempotencyKey as string) ||
      undefined;

    const { items, shippingAddress } = req.body;

    const order = await ordersService.createOrder(
      req.user.id,
      { items, shippingAddress },
      idempotencyKey
    );

    res.status(201).json({
      success: true,
      data: order,
    });
  }),

  getOrderById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const orderId = parseInt(req.params['id'] ?? '', 10);
    if (isNaN(orderId)) {
      throw new AppError(400, 'Invalid order ID');
    }

    const order = await ordersService.getOrderById(orderId, req.user.id, req.user.role);

    res.json({
      success: true,
      data: order,
    });
  }),

  getMyOrders: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    const orders = await ordersService.getUserOrders(req.user.id);

    res.json({
      success: true,
      data: orders,
    });
  }),
};
