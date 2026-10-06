import { useSessionStore, type Session } from '@/services/session';
import type { UserRole } from '@/types/roles';

import { MOCK_USERS } from '@/mocks/db';
import { MOCK_TOKEN_PREFIX } from '@/mocks/http';

/** Signs a mock user in (token understood by the MSW handlers) — tests only. */
export function signInAs(role: UserRole): Session {
  const user = MOCK_USERS.find((candidate) => candidate.role === role);
  if (!user) throw new Error(`No mock user for ${role}`);
  const session: Session = {
    accessToken: `${MOCK_TOKEN_PREFIX}${user.id}`,
    user: { id: user.id, name: user.fullName, email: user.email, role },
    expiresAt: null,
  };
  useSessionStore.getState().signIn(session, false);
  return session;
}

const AREA_BY_PREFIX: readonly [string, UserRole][] = [
  ['/super-admin', 'SuperAdmin'],
  ['/parent', 'Parent'],
  ['/teacher', 'Teacher'],
  ['/specialist', 'Specialist'],
  ['/admin', 'Admin'],
];

/** Signs in the role whose area the path belongs to (for tests rendering the real route tree). */
export function signInForPath(path: string): void {
  const match = AREA_BY_PREFIX.find(([prefix]) => path.startsWith(prefix));
  if (match) signInAs(match[1]);
}
