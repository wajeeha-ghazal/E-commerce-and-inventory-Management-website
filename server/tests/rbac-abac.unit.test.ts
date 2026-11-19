import { assertOwnership } from '../src/modules/admin/services/admin.helpers';
import { adminUsersService } from '../src/modules/admin/services/admin.users.service';
import { authorizeRoles } from '../src/middleware/authorize';
import { CurrentUser } from '../src/modules/admin/types';
import { AppError } from '../src/utils/AppError';
import { Request, Response, NextFunction } from 'express';

describe('Layer 2 ABAC: assertOwnership helper', () => {
  const superAdmin: CurrentUser = { id: 1, role: 'super_admin' };
  const adminOwner: CurrentUser = { id: 2, role: 'admin' };
  const adminOther: CurrentUser = { id: 3, role: 'admin' };
  const customer: CurrentUser = { id: 4, role: 'customer' };

  it('should allow super_admin to modify any record regardless of creator', () => {
    expect(() => {
      assertOwnership(superAdmin, { createdBy: 999 }, 'product');
    }).not.toThrow();

    expect(() => {
      assertOwnership(superAdmin, { createdBy: null }, 'category');
    }).not.toThrow();

    expect(() => {
      assertOwnership(superAdmin, {}, 'product');
    }).not.toThrow();
  });

  it('should allow creator admin to modify their own record', () => {
    expect(() => {
      assertOwnership(adminOwner, { createdBy: 2 }, 'product');
    }).not.toThrow();
    expect(() => {
      assertOwnership(adminOwner, { createdBy: 2 }, 'category');
    }).not.toThrow();
  });

  it('should forbid admin from modifying record created by another user', () => {
    try {
      assertOwnership(adminOther, { createdBy: 2 }, 'product');
      fail('Expected assertOwnership to throw');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.statusCode).toBe(403);
      expect(appErr.message).toBe(
        'Forbidden: You do not have permission to modify this product. Only the creator or a super admin can perform this action.'
      );
    }
  });

  it('should forbid admin when record has no createdBy', () => {
    try {
      assertOwnership(adminOwner, { createdBy: null }, 'category');
      fail('Expected assertOwnership to throw');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.statusCode).toBe(403);
      expect(appErr.message).toBe(
        'Forbidden: You do not have permission to modify this category. Only the creator or a super admin can perform this action.'
      );
    }
  });

  it('should forbid customer when attempting to modify record', () => {
    expect(() => {
      assertOwnership(customer, { createdBy: 4 }, 'product');
    }).not.toThrow(); // If customer matches ID it passes assertOwnership, but route-level RBAC blocks customer at Layer 1

    expect(() => {
      assertOwnership(customer, { createdBy: 1 }, 'product');
    }).toThrow(AppError);
  });
});

describe('Layer 1 RBAC: authorizeRoles middleware', () => {
  it('should return 401 when req.user is missing', () => {
    const middleware = authorizeRoles('admin', 'super_admin');
    const req = {} as Request;
    const res = {} as Response;
    let errorPassed: unknown;
    const next: NextFunction = (err) => {
      errorPassed = err;
    };

    middleware(req, res, next);
    expect(errorPassed).toBeInstanceOf(AppError);
    expect((errorPassed as AppError).statusCode).toBe(401);
  });

  it('should return 403 when user role is not in allowedRoles', () => {
    const middleware = authorizeRoles('super_admin');
    const req = { user: { id: 2, role: 'admin' } } as unknown as Request;
    const res = {} as Response;
    let errorPassed: unknown;
    const next: NextFunction = (err) => {
      errorPassed = err;
    };

    middleware(req, res, next);
    expect(errorPassed).toBeInstanceOf(AppError);
    expect((errorPassed as AppError).statusCode).toBe(403);
  });

  it('should call next without error when user role is allowed', () => {
    const middleware = authorizeRoles('admin', 'super_admin');
    const req = { user: { id: 1, role: 'super_admin' } } as unknown as Request;
    const res = {} as Response;
    let called = false;
    const next: NextFunction = (err) => {
      expect(err).toBeUndefined();
      called = true;
    };

    middleware(req, res, next);
    expect(called).toBe(true);
  });
});

describe('Layer 2 ABAC: updateUserRole self-role check', () => {
  it('should throw 400 when user attempts to change their own role', async () => {
    const currentUser: CurrentUser = { id: 1, role: 'super_admin' };

    await expect(
      adminUsersService.updateUserRole(1, 'customer', currentUser)
    ).rejects.toThrow('Security violation: You cannot change your own role.');
  });
});
