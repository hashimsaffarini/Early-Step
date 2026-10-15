import type { UserRole } from '@/types/roles';

/** The signed-in user from `GET Auth/me`. Display + routing only (the backend enforces access). */
export interface SessionUser {
  id: string;
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
