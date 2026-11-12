import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import sequelize from '../../config/database';
import type { User } from './User';

export class Profile extends Model<
  InferAttributes<Profile, { omit: 'user' }>,
  InferCreationAttributes<Profile, { omit: 'user' }>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare fullName: CreationOptional<string>;
  declare phone: CreationOptional<string>;
  declare shippingAddress: CreationOptional<string>;
  declare avatarUrl: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: '',
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    avatarUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
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
  },
  {
    sequelize,
    tableName: 'profiles',
    timestamps: true,
  }
);

export default Profile;
