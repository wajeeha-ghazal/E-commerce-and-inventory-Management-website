import { OrderStatus } from './constants';
import { ProductDTO } from './product';
import { UserDTO } from './auth';

export interface OrderItemDTO {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: ProductDTO;
}

export interface CartItem {
  productId: number;
  title: string;
  price: number;
  imageUrl?: string;
  stock: number;
  quantity: number;
}

export interface OrderDTO {
  id: number;
  userId: number;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItemDTO[];
  user?: UserDTO;
}

export interface CheckoutItemInput {
  productId: number;
  quantity: number;
}

export interface CheckoutInput {
  items: CheckoutItemInput[];
  shippingAddress: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}
