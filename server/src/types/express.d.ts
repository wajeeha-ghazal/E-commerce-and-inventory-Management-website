import { UserDTO } from '@ecomm/shared';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserDTO {}
  }
}

export {};
