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
import type { OrderItem } from './OrderItem';
import { ORDER_STATUSES, OrderStatus } from '@ecomm/shared';

export class Order extends Model<
  InferAttributes<Order, { omit: 'user' | 'items' }>,
  InferCreationAttributes<Order, { omit: 'user' | 'items' }>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare status: CreationOptional<OrderStatus>;
  declare subtotal: number;
  declare tax: number;
  declare total: CreationOptional<number>;
  declare shippingAddress: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<User>;
  declare items?: NonAttribute<OrderItem[]>;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.ENUM(...ORDER_STATUSES),
      allowNull: false,
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('subtotal');
        return val === null ? 0 : parseFloat(val as unknown as string);
      },
      set(val: number | string) {
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        this.setDataValue('subtotal', Math.round((parsed || 0) * 100) / 100);
      },
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('tax');
        return val === null ? 0 : parseFloat(val as unknown as string);
      },
      set(val: number | string) {
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        this.setDataValue('tax', Math.round((parsed || 0) * 100) / 100);
      },
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      get() {
        const val = this.getDataValue('total');
        return val === null ? 0 : parseFloat(val as unknown as string);
      },
      set(val: number | string) {
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        this.setDataValue('total', Math.round((parsed || 0) * 100) / 100);
      },
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'orders',
    timestamps: true,
  }
);

// Automatically compute total = subtotal + tax before validation & save
Order.beforeValidate((order) => {
  if (order.subtotal !== undefined && order.tax !== undefined) {
    order.total = Math.round((Number(order.subtotal) + Number(order.tax)) * 100) / 100;
  }
});

export default Order;
