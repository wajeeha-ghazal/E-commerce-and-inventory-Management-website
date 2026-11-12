import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import sequelize from '../../config/database';
import type { Order } from './Order';
import type { Product } from './Product';

export class OrderItem extends Model<
  InferAttributes<OrderItem, { omit: 'order' | 'product' }>,
  InferCreationAttributes<OrderItem, { omit: 'order' | 'product' }>
> {
  declare id: CreationOptional<number>;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare unitPrice: number;

  // Associations
  declare order?: NonAttribute<Order>;
  declare product?: NonAttribute<Product>;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('unitPrice');
        return val === null ? 0 : parseFloat(val as unknown as string);
      },
      set(val: number | string) {
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        this.setDataValue('unitPrice', Math.round((parsed || 0) * 100) / 100);
      },
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['orderId', 'productId'],
        name: 'unique_order_item_product',
      },
      {
        fields: ['productId'],
      },
    ],
  }
);

export default OrderItem;
