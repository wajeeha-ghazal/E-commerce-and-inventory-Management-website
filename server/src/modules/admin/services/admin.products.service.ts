import { Op } from 'sequelize';
import { Product, Category } from '../../../db/models';
import { CreateProductInput, UpdateProductInput } from '@ecomm/shared';
import { AppError } from '../../../utils/AppError';
import { CurrentUser } from '../types';
import { assertOwnership } from './admin.helpers';

export const adminProductsService = {
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
  },

  async createProduct(input: CreateProductInput, currentUser: CurrentUser) {
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
      createdBy: currentUser.id,
    });

    return await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }],
    });
  },

  async updateProduct(id: number, input: UpdateProductInput, currentUser: CurrentUser) {
    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      throw new AppError(404, `Product #${id} not found`);
    }

    assertOwnership(currentUser, product, 'product');

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
  },

  async deleteProduct(id: number, currentUser: CurrentUser) {
    const product = await Product.findByPk(id);
    if (!product) {
      throw new AppError(404, `Active product #${id} not found`);
    }

    assertOwnership(currentUser, product, 'product');

    // Soft deletion using Sequelize paranoid mode: sets deletedAt
    await product.destroy();

    return await Product.findByPk(id, {
      paranoid: false,
      include: [{ model: Category, as: 'category' }],
    });
  },

  async restoreProduct(id: number, currentUser: CurrentUser) {
    const product = await Product.findByPk(id, { paranoid: false });
    if (!product) {
      throw new AppError(404, `Product #${id} not found`);
    }

    assertOwnership(currentUser, product, 'product');

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
  },
};
