import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from './auth.service';
import { config } from '../../config/env';
import { getCookieOptions, getClearCookieOptions } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import { ApiSuccessResponse, UserDTO } from '@ecomm/shared';

export class AuthController {
  register = async (req: Request, res: Response): Promise<void> => {
    const { user, token } = await authService.register(req.body);

    res.cookie(config.cookieName, token, getCookieOptions());

    const response: ApiSuccessResponse<UserDTO> = {
      success: true,
      data: user,
    };

    res.status(201).json(response);
  };

  login = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      'local',
      { session: false },
      async (err: any, user: UserDTO | false, info: any) => {
        try {
          if (err) {
            return next(err);
          }
          if (!user) {
            return next(new AppError(info?.message || 'Invalid email or password', 401));
          }

          const { user: userDto, token } = await authService.login(user);

          res.cookie(config.cookieName, token, getCookieOptions());

          const response: ApiSuccessResponse<UserDTO> = {
            success: true,
            data: userDto,
          };

          res.status(200).json(response);
        } catch (error) {
          next(error);
        }
      }
    )(req, res, next);
  };

  logout = (req: Request, res: Response): void => {
    res.clearCookie(config.cookieName, getClearCookieOptions());

    const response: ApiSuccessResponse<{ message: string }> = {
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    };

    res.status(200).json(response);
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const currentUser = req.user as UserDTO;
    const user = await authService.getMe(currentUser.id);

    const response: ApiSuccessResponse<UserDTO> = {
      success: true,
      data: user,
    };

    res.status(200).json(response);
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const currentUser = req.user as UserDTO;
    const updatedProfile = await authService.updateProfile(currentUser.id, req.body);

    const response: ApiSuccessResponse<typeof updatedProfile> = {
      success: true,
      data: updatedProfile,
    };

    res.status(200).json(response);
  };
}

export const authController = new AuthController();
export default authController;
