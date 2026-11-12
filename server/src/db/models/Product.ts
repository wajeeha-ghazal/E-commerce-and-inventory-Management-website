import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from 'sequelize';
import sequelize from '../../config/database';
import type { Category } from './Category';
import type { OrderItem } from './OrderItem';

export class Product extends Model<
  InferAttributes<Product, { omit: 'category' | 'orderItems' }>,
  InferCreationAttributes<Product, { omit: 'category' | 'orderItems' }>
> {
  declare id: CreationOptional<number>;
  declare categoryId: number;
  declare title: string;
  declare description: CreationOptional<string>;
  declare sku: string;
  declare price: number;
  declare stock: number;
  declare imageUrl: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;

  // Associations
  declare category?: NonAttribute<Category>;
  declare orderItems?: NonAttribute<OrderItem[]>;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      get() {
        const val = this.getDataValue('price');
        return val === null ? 0 : parseFloat(val as unknown as string);
      },
      set(val: number | string) {
        const parsed = typeof val === 'string' ? parseFloat(val) : val;
        this.setDataValue('price', Math.round((parsed || 0) * 100) / 100);
      },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    imageUrl: {
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
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    paranoid: true,
    timestamps: true,
  }
);

export default Product;
