import { Op } from 'sequelize';
import { Category, Product } from '../../../db/models';
import { CreateCategoryInput, UpdateCategoryInput } from '@ecomm/shared';
import { AppError } from '../../../utils/AppError';
import { CurrentUser } from '../types';
import { assertOwnership } from './admin.helpers';

export const adminCategoriesService = {
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
  },

  async createCategory(input: CreateCategoryInput, currentUser: CurrentUser) {
    const existing = await Category.findOne({ where: { slug: input.slug.trim() } });
    if (existing) {
      throw new AppError(409, `Category with slug "${input.slug}" already exists`);
    }

    return await Category.create({
      name: input.name.trim(),
      slug: input.slug.trim(),
      description: input.description?.trim() || '',
      createdBy: currentUser.id,
    });
  },

  async updateCategory(id: number, input: UpdateCategoryInput, currentUser: CurrentUser) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    assertOwnership(currentUser, category, 'category');

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
  },

  async deleteCategory(id: number, currentUser: CurrentUser) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    assertOwnership(currentUser, category, 'category');

    const activeProductCount = await Product.count({ where: { categoryId: id } });
    if (activeProductCount > 0) {
      throw new AppError(
        409,
        `Cannot delete category "${category.name}" because it contains ${activeProductCount} active product(s). Please reassign or delete them first.`
      );
    }

    await category.destroy();
    return { success: true, message: `Category #${id} soft-deleted successfully` };
  },

  async restoreCategory(id: number, currentUser: CurrentUser) {
    const category = await Category.findByPk(id, { paranoid: false });
    if (!category) {
      throw new AppError(404, `Category #${id} not found`);
    }

    assertOwnership(currentUser, category, 'category');

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
  },
};
