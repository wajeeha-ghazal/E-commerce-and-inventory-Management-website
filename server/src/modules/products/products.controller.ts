import { Request, Response, NextFunction } from 'express';
import { productsService } from './products.service';
import { asyncHandler } from '../../utils/asyncHandler';
import type { ProductQueryParams } from '@ecomm/shared';

export const productsController = {
  getProducts: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const params: ProductQueryParams = {
      search: req.query['search'] as string | undefined,
      categoryId: req.query['categoryId'] ? Number(req.query['categoryId']) : undefined,
      page: req.query['page'] ? Number(req.query['page']) : undefined,
      limit: req.query['limit'] ? Number(req.query['limit']) : undefined,
      sortBy: req.query['sortBy'] as ProductQueryParams['sortBy'] | undefined,
    };

    const data = await productsService.getProducts(params);
    res.json({ success: true, data });
  }),

  getProductById: asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = parseInt(req.params['id'] ?? '', 10);
    const data = await productsService.getProductById(id);
    res.json({ success: true, data });
  }),
};
