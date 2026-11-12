import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { TAX_RATE } from '@ecomm/shared/src/constants';
import type { ProductDTO, CartItem } from '@ecomm/shared';
import { fetchMe, loginUser, logoutUser, resetAuth } from '../auth/authSlice';
import { placeOrder } from '../orders/orderSlice';

export type { CartItem };

export interface CartState {
  items: CartItem[];
  userId: number | null;
  isOpen: boolean;
}

export const getCartStorageKey = (userId?: number | string | null): string =>
  `cart_${userId ?? 'guest'}`;

export const loadCartFromStorage = (userId?: number | string | null): CartItem[] => {
  try {
    const key = getCartStorageKey(userId);
    const data = localStorage.getItem(key);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load cart from localStorage:', err);
    return [];
  }
};

export const saveCartToStorage = (items: CartItem[], userId?: number | string | null): void => {
  try {
    const key = getCartStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save cart to localStorage:', err);
  }
};

const initialState: CartState = {
  items: loadCartFromStorage(null),
  userId: null,
  isOpen: false,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ product: ProductDTO; quantity?: number }>) {
      if (!state.userId) {
        return;
      }
      const { product, quantity = 1 } = action.payload;
      if (!product || product.stock <= 0 || quantity <= 0) return;

      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        // Checks in-memory item quantity against product stock & caps at available stock
        existing.stock = product.stock;
        existing.price = product.price;
        existing.title = product.title;
        if (product.imageUrl) existing.imageUrl = product.imageUrl;
        existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      } else {
        const cappedQuantity = Math.min(quantity, product.stock);
        state.items.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
          quantity: cappedQuantity,
        });
      }
      saveCartToStorage(state.items, state.userId);
    },

    updateQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
      const { productId, quantity } = action.payload;
      const index = state.items.findIndex((i) => i.productId === productId);
      if (index >= 0) {
        if (quantity <= 0) {
          state.items.splice(index, 1);
        } else {
          const item = state.items[index];
          // Caps max selectable quantity at current available stock
          item.quantity = Math.min(quantity, item.stock);
        }
        saveCartToStorage(state.items, state.userId);
      }
    },

    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveCartToStorage(state.items, state.userId);
    },

    clearCart(state) {
      state.items = [];
      saveCartToStorage(state.items, state.userId);
    },

    openCart(state) {
      state.isOpen = true;
    },

    closeCart(state) {
      state.isOpen = false;
    },

    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },

    setUserId(state, action: PayloadAction<number | null>) {
      const newUserId = action.payload;
      if (state.userId !== newUserId) {
        const guestItems = loadCartFromStorage(null);
        const userItems = newUserId ? loadCartFromStorage(newUserId) : [];

        if (newUserId) {
          // Merge guest cart into authenticated user cart
          const mergedMap = new Map<number, CartItem>();
          userItems.forEach((item) => mergedMap.set(item.productId, { ...item }));
          guestItems.forEach((guestItem) => {
            const existing = mergedMap.get(guestItem.productId);
            if (existing) {
              existing.quantity = Math.min(existing.quantity + guestItem.quantity, existing.stock);
            } else {
              mergedMap.set(guestItem.productId, { ...guestItem });
            }
          });
          state.items = Array.from(mergedMap.values());
          state.userId = newUserId;
          saveCartToStorage(state.items, newUserId);
          try {
            localStorage.removeItem(getCartStorageKey(null));
          } catch {
            // Ignore storage errors
          }
        } else {
          // Switched to guest
          state.userId = null;
          state.items = guestItems;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.fulfilled, (state, action) => {
        cartSlice.caseReducers.setUserId(state, {
          type: 'cart/setUserId',
          payload: action.payload.id,
        });
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        cartSlice.caseReducers.setUserId(state, {
          type: 'cart/setUserId',
          payload: action.payload.id,
        });
      })
      .addCase(logoutUser.fulfilled, (state) => {
        cartSlice.caseReducers.setUserId(state, {
          type: 'cart/setUserId',
          payload: null,
        });
      })
      .addCase(resetAuth, (state) => {
        cartSlice.caseReducers.setUserId(state, {
          type: 'cart/setUserId',
          payload: null,
        });
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.items = [];
        saveCartToStorage([], state.userId);
      });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  openCart,
  closeCart,
  toggleCart,
  setUserId,
} = cartSlice.actions;

// Derived state via createSelector
type StateWithCart = { cart: CartState };

export const selectCartState = (state: StateWithCart): CartState => state.cart;

export const selectCartItems = createSelector([selectCartState], (cart): CartItem[] => cart.items);

export const selectCartIsOpen = createSelector([selectCartState], (cart): boolean => cart.isOpen);

export const selectCartItemCount = createSelector([selectCartItems], (items): number =>
  items.reduce((total, item) => total + item.quantity, 0)
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items): number =>
    Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100
);

export const selectCartTax = createSelector(
  [selectCartSubtotal],
  (subtotal): number => Math.round(subtotal * TAX_RATE * 100) / 100
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectCartTax],
  (subtotal, tax): number => Math.round((subtotal + tax) * 100) / 100
);

export const selectCartItemByProductId = (productId: number) =>
  createSelector([selectCartItems], (items) => items.find((item) => item.productId === productId));

export const selectAvailableStock = (product?: ProductDTO | null) =>
  createSelector([selectCartItems], (items) => {
    if (!product) return 0;
    const inCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;
    return Math.max(0, product.stock - inCart);
  });

export default cartSlice.reducer;
