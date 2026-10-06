import { existsSync, readFileSync } from 'node:fs';

import { login } from '@/features/auth/api/authApi';
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
