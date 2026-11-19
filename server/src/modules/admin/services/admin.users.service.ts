import { User, Profile, Order } from '../../../db/models';
import { USER_ROLES, UserRole } from '@ecomm/shared';
import { AppError } from '../../../utils/AppError';
import { CurrentUser } from '../types';

export const adminUsersService = {
  async getUsers(params?: { page?: number; limit?: number }) {
    const page = params?.page ? Math.max(1, Number(params.page)) : undefined;
    const limit = params?.limit ? Math.max(1, Number(params.limit)) : undefined;

    const include = [
      { model: Profile, as: 'profile' },
      {
        model: Order,
        as: 'orders',
        attributes: ['id', 'status', 'total', 'createdAt'],
      },
    ];

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await User.findAndCountAll({
        order: [['id', 'ASC']],
        attributes: { exclude: ['passwordHash'] },
        include,
        limit: l,
        offset,
        distinct: true,
      });

      return {
        items: rows,
        total: count,
        page: p,
        limit: l,
        totalPages: Math.ceil(count / l),
      };
    }

    return await User.findAll({
      order: [['id', 'ASC']],
      attributes: { exclude: ['passwordHash'] },
      include,
    });
  },

  async updateUserRole(targetUserId: number, newRole: UserRole, currentUser: CurrentUser) {
    if (currentUser.id === targetUserId) {
      throw new AppError(400, 'Security violation: You cannot change your own role.');
    }

    if (!USER_ROLES.includes(newRole)) {
      throw new AppError(400, `Invalid role. Must be one of: ${USER_ROLES.join(', ')}`);
    }

    const user = await User.findByPk(targetUserId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Profile, as: 'profile' }],
    });
    if (!user) {
      throw new AppError(404, `User #${targetUserId} not found`);
    }

    user.role = newRole;
    await user.save();
    return user;
  },
};
