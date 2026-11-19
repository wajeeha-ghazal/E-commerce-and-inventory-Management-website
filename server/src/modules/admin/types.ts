import { UserRole } from '@ecomm/shared';

export interface CurrentUser {
  id: number;
  role: UserRole;
}
