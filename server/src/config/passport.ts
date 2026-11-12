import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, StrategyOptions } from 'passport-jwt';
import { Request } from 'express';
import bcrypt from 'bcryptjs';
import { User, Profile } from '../db/models';
import { config } from './env';
import { JwtPayload } from '../utils/jwt';
import { UserDTO, ProfileDTO } from '@ecomm/shared';

export const formatUserDTO = (user: User, profile?: Profile | null): UserDTO => {
  let profileDto: ProfileDTO | null = null;
  if (profile) {
    profileDto = {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      phone: profile.phone,
      shippingAddress: profile.shippingAddress,
      avatarUrl: profile.avatarUrl,
      createdAt: profile.createdAt ? profile.createdAt.toISOString() : undefined,
      updatedAt: profile.updatedAt ? profile.updatedAt.toISOString() : undefined,
    };
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined,
    profile: profileDto,
  };
};

// 1. Local Strategy for Login
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          where: { email: email.toLowerCase().trim() },
          include: [{ model: Profile, as: 'profile' }],
        });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const userDto = formatUserDTO(user, user.profile);
        return done(null, userDto);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// 2. JWT Strategy extracting from httpOnly cookie
const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies[config.cookieName] || null;
  }
  // Also support Authorization: Bearer token for automated testing convenience
  if (!token && req && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  return token;
};

const jwtOptions: StrategyOptions = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: config.jwt.secret,
  ignoreExpiration: false,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await User.findByPk(payload.id, {
        include: [{ model: Profile, as: 'profile' }],
      });

      if (!user) {
        return done(null, false);
      }

      const userDto = formatUserDTO(user, user.profile);
      return done(null, userDto);
    } catch (error) {
      return done(error, false);
    }
  })
);

export default passport;
