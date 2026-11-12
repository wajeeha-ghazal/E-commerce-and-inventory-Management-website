import { Op } from 'sequelize';
import { Product, Category, Order, OrderItem, User, Profile } from '../../db/models';
import {
  ORDER_STATUSES,
  USER_ROLES,
  OrderStatus,
  UserRole,
  AdminStatsDTO,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@ecomm/shared';
import { AppError } from '../../utils/AppError';

export class AdminService {
  /**
   * Aggregate store statistics: inventory, orders, revenue, and users.
   */
  async getStats(): Promise<AdminStatsDTO> {
    // Inventory stats
    const totalUnitsRaw = await Product.sum('stock', { where: { deletedAt: null } });
    const totalUnits = totalUnitsRaw || 0;
    const distinctProducts = await Product.count({ where: { deletedAt: null } });
    const lowStockCount = await Product.count({
      where: {
        deletedAt: null,
        stock: { [Op.gt]: 0, [Op.lte]: 5 },
      },
    });
    const outOfStockCount = await Product.count({
      where: {
        deletedAt: null,
        stock: 0,
      },
    });

    // Orders stats & revenue (excluding cancelled orders for revenue)
    const totalRevenueRaw = await Order.sum('total', {
      where: { status: { [Op.ne]: 'cancelled' } },
    });
    const totalRevenue = Math.round((Number(totalRevenueRaw) || 0) * 100) / 100;
    const totalOrders = await Order.count();

    const byStatus = {} as Record<OrderStatus, number>;
    for (const status of ORDER_STATUSES) {
      byStatus[status] = await Order.count({ where: { status } });
    }

    // Users stats
    const totalUsers = await User.count();
    const customerCount = await User.count({ where: { role: 'customer' } });
    const adminCount = await User.count({ where: { role: 'admin' } });

    return {
      inventory: {
        totalUnits,
        distinctProducts,
        lowStockCount,
        outOfStockCount,
      },
      orders: {
        totalRevenue,
        totalOrders,
        byStatus,
      },
      users: {
        totalUsers,
        customerCount,
        adminCount,
      },
    };
  }

  // ===================== Product Management =====================

  async getProducts(includeDeleted: boolean = false) {
    return await Product.findAll({
      paranoid: !includeDeleted,
      include: [{ model: Category, as: 'category' }],
      order: [['id', 'DESC']],
    });
  }

  async createProduct(input: CreateProductInput) {
    const category = await Category.findByPk(input.categoryId);
    if (!category) {
      throw new AppError(400, `Category #${input.categoryId} not found`);
    }

    const existingSku = await Product.findOne({
      where: { sku: input.sku.trim() },
      paranoid: false,
    });
    if (existingSku) {
      throw new AppError(409, `Product with SKU "${input.sku}" already exists`);
    }

    const product = await Product.create({
      categoryId: input.categoryId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      sku: input.sku.trim(),
      price: Number(input.price),
      stock: Number(input.stock),
      imageUrl: input.imageUrl?.trim() || '',
    });

    return await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  async updateProduct(id: number, input: UpdateProductInput) {
    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      throw new AppError(404, `Product #${id} not found`);
    }

    if (input.categoryId !== undefined) {
      const category = await Category.findByPk(input.categoryId);
      if (!category) {
        throw new AppError(400, `Category #${input.categoryId} not found`);
      }
      product.categoryId = input.categoryId;
    }

    if (input.sku && input.sku.trim() !== product.sku) {
      const existingSku = await Product.findOne({
        where: { sku: input.sku.trim(), id: { [Op.ne]: id } },
        paranoid: false,
      });
      if (existingSku) {
        throw new AppError(409, `Product with SKU "${input.sku}" already exists`);
      }
      product.sku = input.sku.trim();
    }

    if (input.title !== undefined) product.title = input.title.trim();
    if (input.description !== undefined) product.description = input.description.trim();
    if (input.price !== undefined) product.price = Number(input.price);
    if (input.stock !== undefined) product.stock = Number(input.stock);
    if (input.imageUrl !== undefined) product.imageUrl = input.imageUrl.trim();

    await product.save();

    return await Product.findByPk(product.id, {
      paranoid: false,
      include: [{ model: Category, as: 'category' }],
    });
  }

  async deleteProduct(id: number) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError(404, `Active product #${id} not found`);
    }

    // Soft deletion using Sequelize paranoid mode: sets deletedAt
    await product.destroy();

    return await Product.findByPk(id, {
      paranoid: false,
      include: [{ model: Category, as: 'category' }],
    });
  }

  async restoreProduct(id: number) {
    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      throw new AppError(404, `Product #${id} not found`);
    }

    if (!product.deletedAt) {
      return product;
    }

    // Restores soft-deleted product
    await product.restore();

    return await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  // ===================== Category Management =====================

  async getCategories() {
    return await Category.findAll({
      order: [['id', 'ASC']],
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
    });
  }

  async createCategory(input: CreateCategoryInput) {
    const existing = await Category.findOne({ where: { slug: input.slug.trim() } });
    if (existing) {
      throw new AppError(409, `Category with slug "${input.slug}" already exists`);
    }

    return await Category.create({
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description?.trim() || '',
    });
  }

  async updateCategory(id: number, input: UpdateCategoryInput) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    if (input.slug && input.slug.trim() !== category.slug) {
      const existing = await Category.findOne({
        where: { slug: input.slug.trim(), id: { [Op.ne]: id } },
      });
      if (existing) {
        throw new AppError(409, `Category with slug "${input.slug}" already exists`);
      }
      category.slug = input.slug.trim();
    }

    if (input.name !== undefined) category.name = input.name.trim();
    if (input.description !== undefined) category.description = input.description.trim();

    await category.save();
    return category;
  }

  async deleteCategory(id: number) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    const activeProductCount = await Product.count({ where: { categoryId: id } });
    if (activeProductCount > 0) {
      throw new AppError(
        400,
        `Cannot delete category "${category.name}" because it contains ${activeProductCount} active product(s). Please reassign or delete them first.`
      );
    }

    await category.destroy();
    return { success: true, message: `Category #${id} deleted` };
  }

  // ===================== Global Order Management =====================

  async getOrders(status?: OrderStatus) {
    const whereClause = status ? { status } : {};

    return await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              paranoid: false, // Include product data even if soft-deleted
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new AppError(400, `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`);
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError(404, `Order #${orderId} not found`);
    }

    order.status = status;
    await order.save();

    return await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product', paranoid: false }],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role'],
          include: [{ model: Profile, as: 'profile' }],
        },
      ],
    });
  }

  // ===================== User Management =====================

  async getUsers() {
    return await User.findAll({
      order: [['id', 'ASC']],
      attributes: { exclude: ['passwordHash'] },
      include: [
        { model: Profile, as: 'profile' },
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'status', 'total', 'createdAt'],
        },
      ],
    });
  }

  async updateUserRole(userId: number, role: UserRole) {
    if (!USER_ROLES.includes(role)) {
      throw new AppError(400, `Invalid role. Must be one of: ${USER_ROLES.join(', ')}`);
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Profile, as: 'profile' }],
    });
    if (!user) {
      throw new AppError(404, `User #${userId} not found`);
    }

    if (user.role === 'admin' && role === 'customer') {
      throw new AppError(403, 'Admin accounts cannot be demoted to customer');
    }

    user.role = role;
    await user.save();

    return user;
  }
}

export const adminService = new AdminService();
