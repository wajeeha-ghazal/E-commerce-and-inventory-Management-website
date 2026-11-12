import { body } from 'express-validator';
import { ORDER_STATUSES, USER_ROLES } from '@ecomm/shared';

export const createProductValidator = [
  body('categoryId').isInt({ min: 1 }).withMessage('Valid categoryId is required').toInt(),

  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),

  body('description').optional().isString().trim(),

  body('sku')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 100 })
    .withMessage('SKU cannot exceed 100 characters'),

  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat(),

  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer').toInt(),

  body('imageUrl').optional().isString().trim(),
];

export const updateProductValidator = [
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid categoryId is required')
    .toInt(),

  body('title')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Product title cannot be empty')
    .isLength({ max: 255 }),

  body('description').optional().isString().trim(),

  body('sku')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('SKU cannot be empty')
    .isLength({ max: 100 }),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer')
    .toInt(),

  body('imageUrl').optional().isString().trim(),
];

export const createCategoryValidator = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 }),

  body('slug')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category slug is required')
    .isLength({ max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('description').optional().isString().trim(),
];

export const updateCategoryValidator = [
  body('name')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category name cannot be empty')
    .isLength({ max: 100 }),

  body('slug')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Category slug cannot be empty')
    .isLength({ max: 100 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens'),

  body('description').optional().isString().trim(),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(ORDER_STATUSES)
    .withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`),
];

export const updateUserRoleValidator = [
  body('role')
    .isIn(USER_ROLES)
    .withMessage(`Role must be one of: ${USER_ROLES.join(', ')}`),
];
