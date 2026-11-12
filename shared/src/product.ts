export interface CategoryDTO {
  id: number;
  name: string;
  slug: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDTO {
  id: number;
  categoryId: number;
  title: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  category?: CategoryDTO;
}

export interface CreateProductInput {
  categoryId: number;
  title: string;
  description: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface UpdateProductInput {
  categoryId?: number;
  title?: string;
  description?: string;
  sku?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
}

export interface ProductQueryParams {
  search?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'created_desc' | 'title_asc';
}
