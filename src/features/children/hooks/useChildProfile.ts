import type { AreaRole } from '@/constants/routes';
import { useChildrenForRole } from '@/hooks/api/childResources';
import type { ChildSummary } from '@/services/api/childrenLists';
import type { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import { useParentChild } from '../api/childrenQueries';

export type ChildProfileState =
  | { status: 'loading' }
  | { status: 'error'; error: AppError; retry: () => void }
  | { status: 'not-found' }
  | { status: 'blocked' }
  | { status: 'ready'; child: ChildSummary };

/**
 * Resolves the child shown on the profile:
 * - Parent → `GET Parent/{childId}` (403/404 → not found).
 * - Teacher / Specialist → their assigned list (no staff child-detail endpoint exists).
 * - Admin → BLOCKED BY BACKEND (no admin child endpoint).
 */
export function useChildProfile(role: AreaRole, childId: string): ChildProfileState {
  const isParent = role === 'Parent';
  const parentChild = useParentChild(childId, isParent);
  // Staff list query; for the parent pass 'Admin' (no endpoint) so it stays disabled.
  const staffList = useChildrenForRole(isParent ? 'Admin' : role);

  if (role === 'Admin') return { status: 'blocked' };

  if (isParent) {
    if (parentChild.isPending) return { status: 'loading' };
    if (parentChild.isError) {
      const status = parentChild.error.status;
      if (status === HTTP_STATUS.NOT_FOUND || status === HTTP_STATUS.FORBIDDEN) {
        return { status: 'not-found' };
      }
      return { status: 'error', error: parentChild.error, retry: () => void parentChild.refetch() };
    }
    return { status: 'ready', child: parentChild.data };
  }

  if (staffList.isPending) return { status: 'loading' };
  if (staffList.isError) {
    return { status: 'error', error: staffList.error, retry: () => void staffList.refetch() };
  }
  const child = staffList.data.find((candidate) => candidate.id === childId);
  return child ? { status: 'ready', child } : { status: 'not-found' };
}
