import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '../../services/api';
import type {
  AdminStatsDTO,
  ProductDTO,
  CategoryDTO,
  OrderDTO,
  UserDTO,
  OrderStatus,
  UserRole,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
  ApiResponse,
  ApiErrorResponse,
} from '@ecomm/shared';

export interface AdminState {
  stats: AdminStatsDTO | null;
  statsLoading: boolean;

  products: ProductDTO[];
  productsLoading: boolean;

  categories: CategoryDTO[];
  categoriesLoading: boolean;

  orders: OrderDTO[];
  ordersLoading: boolean;

  users: UserDTO[];
  usersLoading: boolean;

  error: string | null;
  successMessage: string | null;
}

const initialState: AdminState = {
  stats: null,
  statsLoading: false,

  products: [],
  productsLoading: false,

  categories: [],
  categoriesLoading: false,

  orders: [],
  ordersLoading: false,

  users: [],
  usersLoading: false,

  error: null,
  successMessage: null,
};

// 1. Stats
export const fetchAdminStats = createAsyncThunk<AdminStatsDTO, void, { rejectValue: string }>(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiResponse<AdminStatsDTO>>('/admin/stats');
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue('Failed to load store stats');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to load store stats');
    }
  }
);

// 2. Products
export const fetchAdminProducts = createAsyncThunk<
  ProductDTO[],
  boolean | undefined,
  { rejectValue: string }
>('admin/fetchAdminProducts', async (includeDeleted = true, { rejectWithValue }) => {
  try {
    const res = await api.get<ApiResponse<ProductDTO[]>>('/admin/products', {
      params: { includeDeleted: includeDeleted ? 'true' : 'false' },
    });
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to load products');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to load products');
  }
});

export const createAdminProduct = createAsyncThunk<
  ProductDTO,
  CreateProductInput,
  { rejectValue: string }
>('admin/createAdminProduct', async (input, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<ProductDTO>>('/admin/products', input);
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to create product');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to create product');
  }
});

export const updateAdminProduct = createAsyncThunk<
  ProductDTO,
  { id: number; data: UpdateProductInput },
  { rejectValue: string }
>('admin/updateAdminProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiResponse<ProductDTO>>(`/admin/products/${id}`, data);
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to update product');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update product');
  }
});

export const deleteAdminProduct = createAsyncThunk<ProductDTO, number, { rejectValue: string }>(
  'admin/deleteAdminProduct',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete<ApiResponse<ProductDTO>>(`/admin/products/${id}`);
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue('Failed to delete product');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete product');
    }
  }
);

export const restoreAdminProduct = createAsyncThunk<ProductDTO, number, { rejectValue: string }>(
  'admin/restoreAdminProduct',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.patch<ApiResponse<ProductDTO>>(`/admin/products/${id}/restore`);
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue('Failed to restore product');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to restore product');
    }
  }
);

// 3. Categories
export const fetchAdminCategories = createAsyncThunk<CategoryDTO[], void, { rejectValue: string }>(
  'admin/fetchAdminCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiResponse<CategoryDTO[]>>('/admin/categories');
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue('Failed to load categories');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to load categories');
    }
  }
);

export const createAdminCategory = createAsyncThunk<
  CategoryDTO,
  CreateCategoryInput,
  { rejectValue: string }
>('admin/createAdminCategory', async (input, { rejectWithValue }) => {
  try {
    const res = await api.post<ApiResponse<CategoryDTO>>('/admin/categories', input);
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to create category');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to create category');
  }
});

export const updateAdminCategory = createAsyncThunk<
  CategoryDTO,
  { id: number; data: UpdateCategoryInput },
  { rejectValue: string }
>('admin/updateAdminCategory', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put<ApiResponse<CategoryDTO>>(`/admin/categories/${id}`, data);
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to update category');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update category');
  }
});

export const deleteAdminCategory = createAsyncThunk<number, number, { rejectValue: string }>(
  'admin/deleteAdminCategory',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete<ApiResponse<unknown>>(`/admin/categories/${id}`);
      if (res.data.success) {
        return id;
      }
      return rejectWithValue('Failed to delete category');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete category');
    }
  }
);

// 4. Global Orders
export const fetchAdminOrders = createAsyncThunk<
  OrderDTO[],
  OrderStatus | undefined,
  { rejectValue: string }
>('admin/fetchAdminOrders', async (status, { rejectWithValue }) => {
  try {
    const params = status ? { status } : {};
    const res = await api.get<ApiResponse<OrderDTO[]>>('/admin/orders', { params });
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to load orders');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to load orders');
  }
});

export const updateAdminOrderStatus = createAsyncThunk<
  OrderDTO,
  { id: number; status: OrderStatus },
  { rejectValue: string }
>('admin/updateAdminOrderStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.patch<ApiResponse<OrderDTO>>(`/admin/orders/${id}/status`, { status });
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to update order status');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update order status');
  }
});

// 5. Users
export const fetchAdminUsers = createAsyncThunk<UserDTO[], void, { rejectValue: string }>(
  'admin/fetchAdminUsers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiResponse<UserDTO[]>>('/admin/users');
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue('Failed to load users');
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to load users');
    }
  }
);

export const updateAdminUserRole = createAsyncThunk<
  UserDTO,
  { id: number; role: UserRole },
  { rejectValue: string }
>('admin/updateAdminUserRole', async ({ id, role }, { rejectWithValue }) => {
  try {
    const res = await api.patch<ApiResponse<UserDTO>>(`/admin/users/${id}/role`, { role });
    if (res.data.success) {
      return res.data.data;
    }
    return rejectWithValue('Failed to update user role');
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to update user role');
  }
});

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearAdminSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload || null;
      });

    // Products
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || null;
      })
      .addCase(createAdminProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.successMessage = 'Product created successfully';
      })
      .addCase(updateAdminProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.products[idx] = action.payload;
        state.successMessage = 'Product updated successfully';
      })
      .addCase(deleteAdminProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.products[idx] = action.payload;
        state.successMessage = 'Product soft-deleted successfully';
      })
      .addCase(restoreAdminProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.products[idx] = action.payload;
        state.successMessage = 'Product restored successfully';
      });

    // Categories
    builder
      .addCase(fetchAdminCategories.pending, (state) => {
        state.categoriesLoading = true;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(createAdminCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.successMessage = 'Category created successfully';
      })
      .addCase(updateAdminCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.categories[idx] = action.payload;
        state.successMessage = 'Category updated successfully';
      })
      .addCase(deleteAdminCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
        state.successMessage = 'Category deleted successfully';
      });

    // Orders
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx >= 0) state.orders[idx] = action.payload;
        state.successMessage = `Order #${action.payload.id} updated to "${action.payload.status}"`;
      });

    // Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(updateAdminUserRole.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.users[idx] = action.payload;
        state.successMessage = `User #${action.payload.id} role updated to "${action.payload.role}"`;
      });
  },
});

export const { clearAdminError, clearAdminSuccess } = adminSlice.actions;

export default adminSlice.reducer;
