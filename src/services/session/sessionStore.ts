import { create } from 'zustand';

import type { Session, SessionUser } from './types';

/**
 * Session storage strategy (see docs/SECURITY.md):
 * - Only the bearer token and its expiry are stored — never the user's name, email or role. The
 *   user always comes from `GET Auth/me` (at login and again after every reload), so the role used
 *   for routing is the server's current one.
 * - "تذكّرني" checked → localStorage (survives restarts); otherwise sessionStorage (tab only).
 * - The backend issues a bearer token with no refresh endpoint and no logout endpoint, so
 *   logout is local: the token is dropped and every cached query is cleared.
 * - Web storage is readable by scripts on this origin; XSS defences (no unsafe HTML, strict
 *   output encoding) matter. An HttpOnly cookie would be safer but the backend does not offer it.
 */
const STORAGE_KEY = 'early-step.session';

/** A token restored from storage, waiting for `Auth/me` to confirm who it belongs to. */
export interface StoredToken {
  accessToken: string;
  expiresAt: number | null;
}

function safeStorage(kind: 'local' | 'session'): Storage | undefined {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

function readStored(storage: Storage | undefined): StoredToken | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<StoredToken>;
    if (typeof stored.accessToken !== 'string' || !stored.accessToken) return null;
    return {
      accessToken: stored.accessToken,
      expiresAt: typeof stored.expiresAt === 'number' ? stored.expiresAt : null,
    };
  } catch {
    return null;
  }
}

function clearStoredSession(): void {
  safeStorage('session')?.removeItem(STORAGE_KEY);
  safeStorage('local')?.removeItem(STORAGE_KEY);
}

function isExpired(expiresAt: number | null, now = Date.now()): boolean {
  return expiresAt !== null && expiresAt <= now;
}

export function isSessionExpired(session: Session, now = Date.now()): boolean {
  return isExpired(session.expiresAt, now);
}

function loadStoredToken(): StoredToken | null {
  const stored = readStored(safeStorage('session')) ?? readStored(safeStorage('local'));
  if (stored && isExpired(stored.expiresAt)) {
    clearStoredSession();
    return null;
  }
  return stored;
}

interface SessionState {
  /** The signed-in user, confirmed by `Auth/me`. */
  session: Session | null;
  /** A stored token not confirmed yet (app reload); guards wait while it is set. */
  pending: StoredToken | null;
  signIn: (session: Session, remember: boolean) => void;
  /** Completes a reload: the pending token now has its user from `Auth/me`. */
  restore: (user: SessionUser) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  pending: loadStoredToken(),
  signIn: (session, remember) => {
    clearStoredSession();
    const stored: StoredToken = { accessToken: session.accessToken, expiresAt: session.expiresAt };
    safeStorage(remember ? 'local' : 'session')?.setItem(STORAGE_KEY, JSON.stringify(stored));
    set({ session, pending: null });
  },
  restore: (user) => {
    const { pending } = get();
    if (!pending) return;
    set({ session: { ...pending, user }, pending: null });
  },
  signOut: () => {
    clearStoredSession();
    set({ session: null, pending: null });
  },
}));

/** Current session (or null). Expired sessions are treated as signed out. */
export function useSession(): Session | null {
  const session = useSessionStore((state) => state.session);
  return session && !isSessionExpired(session) ? session : null;
}

/** The stored token being confirmed after a reload (null when there is nothing to restore). */
export function usePendingToken(): StoredToken | null {
  return useSessionStore((state) => state.pending);
}

/** Non-React access for the HTTP interceptor (the pending token is sent to `Auth/me`). */
export function getAccessToken(): string | null {
  const { session, pending } = useSessionStore.getState();
  if (session) return isSessionExpired(session) ? null : session.accessToken;
  return pending && !isExpired(pending.expiresAt) ? pending.accessToken : null;
}

/** True while there is a session or a pending token (a 401 should then sign out). */
export function hasSessionOrToken(): boolean {
  const { session, pending } = useSessionStore.getState();
  return session !== null || pending !== null;
}
