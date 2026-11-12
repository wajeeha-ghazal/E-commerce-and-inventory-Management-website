import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import type { CategoryDTO } from '@ecomm/shared/src/product';
import type { ApiSuccessResponse } from '@ecomm/shared/src/api';

interface CategoryState {
  items: CategoryDTO[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk<CategoryDTO[]>(
  'categories/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<ApiSuccessResponse<CategoryDTO[]>>('/categories');
      return res.data.data;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message ?? 'Failed to load categories';
      return rejectWithValue(msg);
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;
