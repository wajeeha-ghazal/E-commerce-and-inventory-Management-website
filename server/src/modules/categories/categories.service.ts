import { Category } from '../../db/models';
import type { CategoryDTO } from '@ecomm/shared/src/product';

function formatCategoryDTO(cat: Category): CategoryDTO {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? '',
    createdAt: cat.createdAt?.toISOString(),
    updatedAt: cat.updatedAt?.toISOString(),
  };
}

export const categoriesService = {
  async getAll(): Promise<CategoryDTO[]> {
    const rows = await Category.findAll({ order: [['name', 'ASC']] });
    return rows.map(formatCategoryDTO);
  },
};
