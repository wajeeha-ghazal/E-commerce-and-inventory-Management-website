import { body } from 'express-validator';

export const checkoutValidator = [
  body('items').isArray({ min: 1 }).withMessage('Order items list cannot be empty'),

  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid productId')
    .toInt(),

  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1').toInt(),

  body('shippingAddress')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Shipping address must be between 5 and 1000 characters'),
];
