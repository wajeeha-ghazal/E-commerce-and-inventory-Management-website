import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '../../services/api';
import type { OrderDTO, CheckoutInput, ApiResponse, ApiErrorResponse } from '@ecomm/shared';

export interface PlaceOrderArgs extends CheckoutInput {
  idempotencyKey?: string;
}

export interface OrdersState {
  currentOrder: OrderDTO | null;
  ordersList: OrderDTO[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;
}

const initialState: OrdersState = {
  currentOrder: null,
  ordersList: [],
  status: 'idle',
  error: null,
  listStatus: 'idle',
  listError: null,
};

export const placeOrder = createAsyncThunk<
  OrderDTO,
  PlaceOrderArgs,
  { rejectValue: { message: string } }
>('orders/placeOrder', async ({ items, shippingAddress, idempotencyKey }, { rejectWithValue }) => {
  try {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    // Submits ONLY { items: [{ productId, quantity }], shippingAddress }
    // Client prices are completely omitted to prevent tampering
    const sanitizedItems = items.map((i) => ({
      productId: Number(i.productId),
      quantity: Number(i.quantity),
    }));

    const response = await api.post<ApiResponse<OrderDTO>>(
      '/orders',
      { items: sanitizedItems, shippingAddress },
      { headers }
    );

    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({ message: 'Failed to place order' });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const message =
      error.response?.data?.error?.message || 'Failed to place order. Please try again.';
    return rejectWithValue({ message });
  }
});

export const fetchOrderById = createAsyncThunk<
  OrderDTO,
  number,
  { rejectValue: { message: string } }
>('orders/fetchOrderById', async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<OrderDTO>>(`/orders/${orderId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({ message: 'Order not found' });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const message = error.response?.data?.error?.message || 'Failed to fetch order details.';
    return rejectWithValue({ message });
  }
});

export const fetchMyOrders = createAsyncThunk<
  OrderDTO[],
  void,
  { rejectValue: { message: string } }
>('orders/fetchMyOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ApiResponse<OrderDTO[]>>('/orders');
    if (response.data.success) {
      return response.data.data;
    }
    return rejectWithValue({ message: 'Failed to fetch orders' });
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>;
    const message = error.response?.data?.error?.message || 'Failed to fetch order list.';
    return rejectWithValue({ message });
  }
});

export const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.status = 'idle';
    },
    clearOrderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // placeOrder
    builder.addCase(placeOrder.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(placeOrder.fulfilled, (state, action: PayloadAction<OrderDTO>) => {
      state.status = 'succeeded';
      state.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(placeOrder.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.message || 'Failed to place order';
    });

    // fetchOrderById
    builder.addCase(fetchOrderById.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });
    builder.addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<OrderDTO>) => {
      state.status = 'succeeded';
      state.currentOrder = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOrderById.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.message || 'Failed to fetch order';
    });

    // fetchMyOrders
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<OrderDTO[]>) => {
        state.listStatus = 'succeeded';
        state.ordersList = action.payload;
        state.listError = null;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload?.message || 'Failed to load order history';
      });
  },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;
