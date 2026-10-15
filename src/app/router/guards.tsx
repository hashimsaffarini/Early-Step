import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { getRoleHomePath, ROUTE_PATHS } from '@/constants/routes';
import { SessionRestore } from '@/features/auth';
import { usePendingToken, useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

export interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
}

/**
 * Route guard for a role area. UX only — the backend must enforce authorization on every
 * endpoint (see docs/SECURITY.md: some backend endpoints currently do not).
 * Stored token after a reload → wait for `Auth/me`; signed out → login (remembering the target);
 * wrong role → /unauthorized.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const session = useSession();
  const pending = usePendingToken();
  const location = useLocation();
  if (pending) return <SessionRestore />;
  if (!session) {
    return <Navigate to={ROUTE_PATHS.login} replace state={{ from: location.pathname }} />;
  }
  if (session.user.role !== role) {
    return <Navigate to={ROUTE_PATHS.unauthorized} replace />;
  }
  return children;
}

/** Login / register: a signed-in user goes straight to their own area. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const session = useSession();
  const pending = usePendingToken();
  if (pending) return <SessionRestore />;
  return session ? <Navigate to={getRoleHomePath(session.user.role)} replace /> : children;
}
