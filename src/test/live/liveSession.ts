import { existsSync, readFileSync } from 'node:fs';

import { login } from '@/features/auth/api/authApi';
import { httpClient } from '@/services/http/httpClient';
import { registerHttpAuthHooks } from '@/services/http/interceptors';
import type { Session } from '@/services/session';

/** Live-test credentials from the gitignored `.env.e2e.local` (values are never printed). */
const ENV_FILE = new URL('../../../.env.e2e.local', import.meta.url);

export type LiveAccount = 'PARENT' | 'SPECIALIST' | 'ADMIN' | 'SUPERADMIN';

function readCredentials(): Record<string, string> {
  if (!existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    readFileSync(ENV_FILE, 'utf8')
      .split('\n')
      .filter((line) => line.includes('=') && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

const credentials = readCredentials();

export function hasAccount(account: LiveAccount): boolean {
  return Boolean(credentials[`E2E_${account}_EMAIL`] && credentials[`E2E_${account}_PASSWORD`]);
}

let token: string | null = null;
registerHttpAuthHooks({ getAccessToken: () => token, onUnauthorized: () => undefined });

/**
 * Vitest prints thrown errors with all their properties. Axios errors carry the request config
 * (bearer token, login body) and the response (possibly personal data), so strip them before any
 * error reaches the reporter. Runs after the app's normalizer, on the AppError and its cause.
 */
function redact(error: unknown): void {
  for (let current = error; typeof current === 'object' && current !== null;) {
    const record = current as Record<string, unknown>;
    if ('config' in record) record.config = '[redacted]';
    if ('request' in record) record.request = '[redacted]';
    if ('response' in record) record.response = '[redacted]';
    current = record.cause;
  }
}
httpClient.interceptors.response.use(undefined, (error: unknown) => {
  redact(error);
  return Promise.reject(error instanceof Error ? error : new Error(String(error)));
});

/** Signs in through the app's real `login()` (verifies the login contract too). */
export async function signInLive(account: LiveAccount): Promise<Session> {
  const session = await login({
    email: credentials[`E2E_${account}_EMAIL`] ?? '',
    password: credentials[`E2E_${account}_PASSWORD`] ?? '',
    rememberMe: false,
  });
  token = session.accessToken;
  return session;
}

/** Drops the token: the next calls are anonymous. */
export function signOutLive(): void {
  token = null;
}
