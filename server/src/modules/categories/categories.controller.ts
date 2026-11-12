import { Request, Response, NextFunction } from 'express';
import { categoriesService } from './categories.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const categoriesController = {
  getAll: asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const data = await categoriesService.getAll();
    res.json({ success: true, data });
  }),
};
