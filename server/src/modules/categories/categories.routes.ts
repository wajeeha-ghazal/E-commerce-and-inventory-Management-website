import { Router } from 'express';
import { categoriesController } from './categories.controller';

const router = Router();

// GET /api/categories — public, no auth required
router.get('/', categoriesController.getAll);

export default router;
