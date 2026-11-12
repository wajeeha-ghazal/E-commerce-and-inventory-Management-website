import sequelize from '../../config/database';
import User from './User';
import Profile from './Profile';
import Category from './Category';
import Product from './Product';
import Order from './Order';
import OrderItem from './OrderItem';

// 1:1 User <-> Profile
User.hasOne(Profile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE',
});
Profile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// 1:N User <-> Order
User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'RESTRICT',
});
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// 1:N Category <-> Product
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
  onDelete: 'RESTRICT',
});
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category',
});

// 1:N Order <-> OrderItem
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'RESTRICT',
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

// 1:N Product <-> OrderItem
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems',
  onDelete: 'RESTRICT',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// N:M Order <-> Product
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: 'orderId',
  otherKey: 'productId',
  as: 'products',
});
Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: 'productId',
  otherKey: 'orderId',
  as: 'orders',
});

export { sequelize, User, Profile, Category, Product, Order, OrderItem };

export default {
  sequelize,
  User,
  Profile,
  Category,
  Product,
  Order,
  OrderItem,
};
