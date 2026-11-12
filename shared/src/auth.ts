import { UserRole } from './constants';

export interface ProfileDTO {
  id: number;
  userId: number;
  fullName: string;
  phone: string;
  shippingAddress: string;
  avatarUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserDTO {
  id: number;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  profile?: ProfileDTO | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  shippingAddress?: string;
  avatarUrl?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  shippingAddress?: string;
  avatarUrl?: string;
}
