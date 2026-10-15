import { AppError } from '@/services/http/apiError';
import type { StoredToken } from '@/services/session';

/**
 * Reads the bearer token from the login response.
 *
 * VERIFIED LIVE (2026-10-06, all demo roles): `200 { id, fullName, accessToken, role }`.
 * `accessToken` is a JWT (HS, issuer `EarlyStepAPI`, audience `EarlyStepClient`) valid 120 h; its
 * `exp` gives the session expiry. Who the user is (id, name, email, role) comes from
 * `GET Auth/me` instead (verified 2026-10-14), so the login fields are not duplicated here. The JWT
 * is decoded for the expiry only — never trusted.
 */
const TOKEN_KEYS = ['accessToken'] as const;
const MS_PER_SECOND = 1000;

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Json)
    : null;
}

export function decodeJwtPayload(token: string): Json | null {
  const parts = token.split('.');
  const payload = parts[1];
  if (parts.length !== 3 || !payload) return null;
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return asRecord(parsed);
  } catch {
    return null;
  }
}

export function parseLoginResponse(data: unknown): StoredToken {
  const body = asRecord(data);
  const accessToken = TOKEN_KEYS.map((key) => body?.[key]).find(
    (value): value is string => typeof value === 'string' && value.trim() !== '',
  );
  if (!accessToken) {
    throw new AppError('تعذّر إكمال تسجيل الدخول: استجابة غير متوقعة من الخادم.', {
      kind: 'unknown',
      code: 'UNEXPECTED_LOGIN_RESPONSE',
    });
  }
  const exp = decodeJwtPayload(accessToken)?.exp;
  return {
    accessToken,
    expiresAt: typeof exp === 'number' ? exp * MS_PER_SECOND : null,
  };
}
