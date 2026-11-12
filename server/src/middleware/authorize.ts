import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@ecomm/shared';
import { AppError } from '../utils/AppError';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: requires one of the following roles: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

export default authorizeRoles;
