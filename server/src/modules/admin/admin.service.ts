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

  async getProducts(params?: boolean | { includeDeleted?: boolean; page?: number; limit?: number }) {
    const isBool = typeof params === 'boolean';
    const includeDeleted = isBool ? params : params?.includeDeleted ?? false;
    const page = !isBool && params?.page ? Math.max(1, Number(params.page)) : undefined;
    const limit = !isBool && params?.limit ? Math.max(1, Number(params.limit)) : undefined;

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Product.findAndCountAll({
        paranoid: !includeDeleted,
        include: [{ model: Category, as: 'category' }],
        order: [['id', 'DESC']],
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

    // Verify parent category exists and is active
    const activeCategory = await Category.findByPk(product.categoryId);
    if (!activeCategory) {
      const deletedCategory = await Category.findByPk(product.categoryId, { paranoid: false });
      const catName = deletedCategory ? deletedCategory.name : `#${product.categoryId}`;
      throw new AppError(
        409,
        `Cannot restore product "${product.title}" because its category "${catName}" is deleted. Please restore the category first.`
      );
    }

    // Restores soft-deleted product
    await product.restore();

    return await Product.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });
  }

  // ===================== Category Management =====================

  async getCategories(params?: boolean | { includeDeleted?: boolean; page?: number; limit?: number }) {
    const isBool = typeof params === 'boolean';
    const includeDeleted = isBool ? params : params?.includeDeleted ?? false;
    const page = !isBool && params?.page ? Math.max(1, Number(params.page)) : undefined;
    const limit = !isBool && params?.limit ? Math.max(1, Number(params.limit)) : undefined;

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Category.findAndCountAll({
        paranoid: !includeDeleted,
        order: [['id', 'ASC']],
        include: [{ model: Product, as: 'products', attributes: ['id'], paranoid: false }],
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

    return await Category.findAll({
      paranoid: !includeDeleted,
      order: [['id', 'ASC']],
      include: [{ model: Product, as: 'products', attributes: ['id'], paranoid: false }],
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
        409,
        `Cannot delete category "${category.name}" because it contains ${activeProductCount} active product(s). Please reassign or delete them first.`
      );
    }

    await category.destroy();
    return { success: true, message: `Category #${id} soft-deleted successfully` };
  }

  async restoreCategory(id: number) {
    const category = await Category.findByPk(id, { paranoid: false });
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    if (!category.deletedAt) {
      return category;
    }

    // Check for conflicting active category with same name or slug
    const conflictingCategory = await Category.findOne({
      where: {
        [Op.or]: [{ name: category.name }, { slug: category.slug }],
        id: { [Op.ne]: id },
      },
    });

    if (conflictingCategory) {
      const field =
        conflictingCategory.name.toLowerCase() === category.name.toLowerCase() ? 'name' : 'slug';
      throw new AppError(
        409,
        `Cannot restore category "${category.name}": an active category with the same ${field} already exists.`
      );
    }

    try {
      await category.restore();
    } catch (err: any) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        throw new AppError(
          409,
          `Cannot restore category "${category.name}": an active category with the same name or slug already exists.`
        );
      }
      throw err;
    }

    return category;
  }

  // ===================== Global Order Management =====================

  async getOrders(params?: OrderStatus | { status?: OrderStatus; page?: number; limit?: number }) {
    const isStatusString = typeof params === 'string';
    const status = isStatusString ? params : params?.status;
    const page = !isStatusString && params?.page ? Math.max(1, Number(params.page)) : undefined;
    const limit = !isStatusString && params?.limit ? Math.max(1, Number(params.limit)) : undefined;
    const whereClause = status ? { status } : {};

    const include = [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            paranoid: false,
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role'],
        include: [{ model: Profile, as: 'profile' }],
      },
    ];

    if (page !== undefined || limit !== undefined) {
      const p = page || 1;
      const l = limit || 10;
      const offset = (p - 1) * l;
      const { count, rows } = await Order.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
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

    return await Order.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      include,
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
