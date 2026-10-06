import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { getRoleHomePath, ROUTE_PATHS } from '@/constants/routes';
import { useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

export interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
}

/**
 * Route guard for a role area. UX only — the backend must enforce authorization on every
 * endpoint (see docs/SECURITY.md: some backend endpoints currently do not).
 * Signed out → login (remembering the target); wrong role → /unauthorized.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const session = useSession();
  const location = useLocation();
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
  return session ? <Navigate to={getRoleHomePath(session.user.role)} replace /> : children;
}
