import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { ProductDTO, ProductQueryParams } from '@ecomm/shared/src/product';
import type { ApiSuccessResponse, PaginatedResult } from '@ecomm/shared/src/api';

interface ProductFilters {
  search: string;
  categoryId: number | null;
  sortBy: ProductQueryParams['sortBy'];
}

interface ProductState {
  items: ProductDTO[];
  selected: ProductDTO | null;
  filters: ProductFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selected: null,
  filters: {
    search: '',
    categoryId: null,
    sortBy: 'created_desc',
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  },
  listStatus: 'idle',
  detailStatus: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk<PaginatedResult<ProductDTO>, ProductQueryParams>(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.categoryId) query.set('categoryId', String(params.categoryId));
      if (params.page) query.set('page', String(params.page));
      if (params.limit) query.set('limit', String(params.limit));
      if (params.sortBy) query.set('sortBy', params.sortBy);

      const res = await api.get<ApiSuccessResponse<PaginatedResult<ProductDTO>>>(
        `/products?${query.toString()}`
      );
      return res.data.data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to load products';
      return rejectWithValue(msg);
    }
  }
);

export const fetchProductById = createAsyncThunk<ProductDTO, number>(
  'products/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiSuccessResponse<ProductDTO>>(`/products/${id}`);
      return res.data.data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Product not found';
      return rejectWithValue(msg);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<ProductFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      // Reset to page 1 when filters change
      state.pagination.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.page = action.payload;
    },
    clearSelected(state) {
      state.selected = null;
      state.detailStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Product list
      .addCase(fetchProducts.pending, (state) => {
        state.listStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.error = action.payload as string;
      })
      // Single product
      .addCase(fetchProductById.pending, (state) => {
        state.detailStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setFilters, setPage, clearSelected } = productSlice.actions;
export default productSlice.reducer;
