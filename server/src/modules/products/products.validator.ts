import { query } from 'express-validator';

export const getProductsValidator = [
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Search term too long'),

  query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('categoryId must be a positive integer')
    .toInt(),

  query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1').toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['price_asc', 'price_desc', 'created_desc', 'title_asc'])
    .withMessage('Invalid sortBy value'),
];
