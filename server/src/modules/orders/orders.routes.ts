import { Router } from 'express';
import { ordersController } from './orders.controller';
import { checkoutValidator } from './orders.validator';
import { validate } from '../../middleware/validate';
import { authenticateJwt } from '../../middleware/authenticate';

const router = Router();

// All order operations require authenticated user
router.use(authenticateJwt);

router.post('/', checkoutValidator, validate, ordersController.createOrder);
router.get('/', ordersController.getMyOrders);
router.get('/:id', ordersController.getOrderById);

export default router;
