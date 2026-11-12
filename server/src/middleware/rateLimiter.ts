import rateLimit from 'express-rate-limit';
import { ApiErrorResponse } from '@ecomm/shared';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message: 'Too many login attempts. Please try again after 15 minutes.',
      },
    };
    res.status(429).json(errorResponse);
  },
});

export default loginRateLimiter;
