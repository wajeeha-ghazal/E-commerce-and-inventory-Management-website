import { CurrentUser } from '../types';
import { AppError } from '../../../utils/AppError';

export function assertOwnership(
  currentUser: CurrentUser,
  record: { createdBy?: number | null },
  resourceName: string
): void {
  if (currentUser.role === 'super_admin') {
    return; // Super admin bypasses ownership checks
  }

  if (!record.createdBy || record.createdBy !== currentUser.id) {
    throw new AppError(
      403,
      `Forbidden: You do not have permission to modify this ${resourceName}. Only the creator or a super admin can perform this action.`
    );
  }
}
