import { Op, Order as SequelizeOrder } from 'sequelize';
import { Product, Category } from '../../db/models';
import { AppError } from '../../utils/AppError';
import { DEFAULT_PAGE_SIZE } from '@ecomm/shared';
import type { ProductDTO, CategoryDTO, ProductQueryParams } from '@ecomm/shared';
import type { PaginatedResult } from '@ecomm/shared';

function formatCategoryDTO(cat: Category): CategoryDTO {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? '',
  };
}

function formatProductDTO(product: Product): ProductDTO {
  return {
    id: product.id,
    categoryId: product.categoryId,
    title: product.title,
    description: product.description ?? '',
    sku: product.sku,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl ?? '',
    createdAt: product.createdAt?.toISOString() ?? '',
    updatedAt: product.updatedAt?.toISOString() ?? '',
    deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
    category: product.category ? formatCategoryDTO(product.category) : undefined,
  };
}

function buildOrder(sortBy?: string): SequelizeOrder {
  switch (sortBy) {
    case 'price_asc':
      return [['price', 'ASC']];
    case 'price_desc':
      return [['price', 'DESC']];
    case 'title_asc':
      return [['title', 'ASC']];
    case 'created_desc':
    default:
      return [['createdAt', 'DESC']];
  }
}

export const productsService = {
  async getProducts(params: ProductQueryParams): Promise<PaginatedResult<ProductDTO>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (params.search) {
      where['title'] = { [Op.iLike]: `%${params.search}%` };
    }

    if (params.categoryId) {
      where['categoryId'] = params.categoryId;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description'],
        },
      ],
      order: buildOrder(params.sortBy),
      limit,
      offset,
      paranoid: true, // only non-deleted
      distinct: true, // important for correct count with include
    });

    return {
      items: rows.map(formatProductDTO),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  },

  async getProductById(id: number): Promise<ProductDTO> {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug', 'description'],
        },
      ],
      paranoid: true,
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return formatProductDTO(product);
  },
};
