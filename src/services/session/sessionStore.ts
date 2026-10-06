import { create } from 'zustand';

import type { Session } from './types';

/**
 * Session storage strategy (see docs/SECURITY.md):
 * - "تذكّرني" checked → localStorage (survives restarts); otherwise sessionStorage (tab only).
 * - The backend issues a bearer token with no refresh endpoint and no logout endpoint, so
 *   logout is local: the token is dropped and every cached query is cleared.
 * - Web storage is readable by scripts on this origin; XSS defences (no unsafe HTML, strict
 *   output encoding) matter. An HttpOnly cookie would be safer but the backend does not offer it.
 */
const STORAGE_KEY = 'early-step.session';

function readStored(storage: Storage | undefined): Session | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (typeof session.accessToken !== 'string' || typeof session.user.role !== 'string') {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function safeStorage(kind: 'local' | 'session'): Storage | undefined {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function isSessionExpired(session: Session, now = Date.now()): boolean {
  return session.expiresAt !== null && session.expiresAt <= now;
}

function loadInitialSession(): Session | null {
  const session = readStored(safeStorage('session')) ?? readStored(safeStorage('local'));
  if (session && isSessionExpired(session)) {
    clearStoredSession();
    return null;
  }
  return session;
}

function clearStoredSession(): void {
  safeStorage('session')?.removeItem(STORAGE_KEY);
  safeStorage('local')?.removeItem(STORAGE_KEY);
}

interface SessionState {
  session: Session | null;
  signIn: (session: Session, remember: boolean) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: loadInitialSession(),
  signIn: (session, remember) => {
    clearStoredSession();
    safeStorage(remember ? 'local' : 'session')?.setItem(STORAGE_KEY, JSON.stringify(session));
    set({ session });
  },
  signOut: () => {
    clearStoredSession();
    set({ session: null });
  },
}));

/** Current session (or null). Expired sessions are treated as signed out. */
export function useSession(): Session | null {
  const session = useSessionStore((state) => state.session);
  return session && !isSessionExpired(session) ? session : null;
}

/** Non-React access for the HTTP interceptor. */
export function getAccessToken(): string | null {
  const { session } = useSessionStore.getState();
  return session && !isSessionExpired(session) ? session.accessToken : null;
}
