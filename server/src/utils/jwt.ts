import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';
import { config } from '../config/env';
import { UserRole } from '@ecomm/shared';

export interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};

export const getCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: config.isProduction, //sent over HTTPS connection
    sameSite: 'lax', //not sent on cross site
    maxAge: 1* 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/',
  };
};

export const getClearCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
  };
};
