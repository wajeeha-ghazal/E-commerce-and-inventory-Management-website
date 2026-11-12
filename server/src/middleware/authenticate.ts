import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AppError } from '../utils/AppError';
import { UserDTO } from '@ecomm/shared';

export const authenticateJwt = (req: Request, res: Response, next: NextFunction): void => {
  passport.authenticate('jwt', { session: false }, (err: any, user: UserDTO | false) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default authenticateJwt;
