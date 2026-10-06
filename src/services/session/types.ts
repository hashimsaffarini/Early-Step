import type { UserRole } from '@/types/roles';

/** The signed-in user, as far as the login response tells us. Display + routing only. */
export interface SessionUser {
  id: string | null;
  name: string;
  email: string | null;
  role: UserRole;
}

export interface Session {
  accessToken: string;
  user: SessionUser;
  /** Epoch ms when the token expires (from the JWT `exp`), or null when unknown. */
  expiresAt: number | null;
}
