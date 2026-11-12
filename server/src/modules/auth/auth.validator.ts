import { body } from 'express-validator';

export const registerValidator = [
  body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),
  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Shipping address cannot exceed 500 characters'),
  body('avatarUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Phone number cannot exceed 30 characters'),
  body('shippingAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Shipping address cannot exceed 500 characters'),
  body('avatarUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
];
