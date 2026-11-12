import { Router } from 'express';
import { authController } from './auth.controller';
import { registerValidator, loginValidator, updateProfileValidator } from './auth.validator';
import { validate } from '../../middleware/validate';
import { authenticateJwt } from '../../middleware/authenticate';
import { authorizeRoles } from '../../middleware/authorize';
import { loginRateLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', registerValidator, validate, asyncHandler(authController.register));

router.post('/login', loginRateLimiter, loginValidator, validate, authController.login);

router.post('/logout', authController.logout);

router.get('/me', authenticateJwt, asyncHandler(authController.getMe));

router.put(
  '/me',
  authenticateJwt,
  updateProfileValidator,
  validate,
  asyncHandler(authController.updateProfile)
);

// Admin-check route to verify 403 for customer vs admin
router.get('/admin-check', authenticateJwt, authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin access granted',
      user: req.user as any,
    },
  });
});

export default router;
