import bcrypt from 'bcryptjs';
import { sequelize } from '../../config/database';
import { User, Profile } from '../../db/models';
import { AppError } from '../../utils/AppError';
import { signToken } from '../../utils/jwt';
import { formatUserDTO } from '../../config/passport';
import { RegisterInput, UpdateProfileInput, UserDTO, ProfileDTO } from '@ecomm/shared';

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: UserDTO; token: string }> {
    const email = input.email.toLowerCase().trim();

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email is already registered', 400, {
        email: 'Email is already registered',
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.password, saltRounds);

    const { user, profile } = await sequelize.transaction(async (t) => {
      const createdUser = await User.create(
        {
          email,
          passwordHash,
          role: 'customer',
        },
        { transaction: t }
      );

      const createdProfile = await Profile.create(
        {
          userId: createdUser.id,
          fullName: input.fullName || '',
          phone: input.phone || '',
          shippingAddress: input.shippingAddress || '',
          avatarUrl: input.avatarUrl || '',
        },
        { transaction: t }
      );

      return { user: createdUser, profile: createdProfile };
    });

    const userDto = formatUserDTO(user, profile);
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: userDto, token };
  }

  async login(user: UserDTO): Promise<{ user: UserDTO; token: string }> {
    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  }

  async getMe(userId: number): Promise<UserDTO> {
    const user = await User.findByPk(userId, {
      include: [{ model: Profile, as: 'profile' }],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return formatUserDTO(user, user.profile);
  }

  async updateProfile(userId: number, input: UpdateProfileInput): Promise<ProfileDTO> {
    const [profile] = await Profile.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        fullName: input.fullName || '',
        phone: input.phone || '',
        shippingAddress: input.shippingAddress || '',
        avatarUrl: input.avatarUrl || '',
      },
    });

    if (input.fullName !== undefined) profile.fullName = input.fullName;
    if (input.phone !== undefined) profile.phone = input.phone;
    if (input.shippingAddress !== undefined) profile.shippingAddress = input.shippingAddress;
    if (input.avatarUrl !== undefined) profile.avatarUrl = input.avatarUrl;

    await profile.save();

    return {
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
}

export const authService = new AuthService();
export default authService;
