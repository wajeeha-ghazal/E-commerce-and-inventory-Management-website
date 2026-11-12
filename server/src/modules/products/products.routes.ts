import { Router } from 'express';
import { productsController } from './products.controller';
import { getProductsValidator } from './products.validator';
import { validate } from '../../middleware/validate';

const router = Router();

// GET /api/products          — public, paginated, searchable, filterable
router.get('/', getProductsValidator, validate, productsController.getProducts);

// GET /api/products/:id      — public, single product with category
router.get('/:id', productsController.getProductById);

export default router;
