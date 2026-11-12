import { configureStore } from '@reduxjs/toolkit';
import authReducer, { resetAuth } from '../features/auth/authSlice';
import categoryReducer from '../features/categories/categorySlice';
import productReducer from '../features/products/productSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/orders/orderSlice';
import adminReducer from '../features/admin/adminSlice';
import { setOnUnauthorizedCallback } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Response interceptor: on 401 dispatch logout / reset auth state
setOnUnauthorizedCallback(() => {
  store.dispatch(resetAuth());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
