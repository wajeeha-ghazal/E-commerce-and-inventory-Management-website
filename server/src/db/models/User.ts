import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import sequelize from '../../config/database';
import type { Profile } from './Profile';
import type { Order } from './Order';
import { USER_ROLES, UserRole } from '@ecomm/shared';

export class User extends Model<
  InferAttributes<User, { omit: 'profile' | 'orders' }>,
  InferCreationAttributes<User, { omit: 'profile' | 'orders' }>
> {
  declare id: CreationOptional<number>;
  declare email: string;
  declare passwordHash: string;
  declare role: CreationOptional<UserRole>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Associations
  declare profile?: NonAttribute<Profile>;
  declare orders?: NonAttribute<Order[]>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...USER_ROLES),
      allowNull: false,
      defaultValue: 'customer',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    paranoid: true,
    timestamps: true,
  }
);

export default User;
