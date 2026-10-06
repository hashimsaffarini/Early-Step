import { normalizeRole } from '@/constants/backendRoles';
import { AppError } from '@/services/http/apiError';
import type { Session } from '@/services/session';

/**
 * Maps the login response to a `Session`.
 *
 * VERIFIED LIVE (2026-10-06, all four demo roles): `200 { id, fullName, accessToken, role }`.
 * `accessToken` is a JWT (HS, issuer `EarlyStepAPI`, audience `EarlyStepClient`) valid 120 h with
 * the standard ASP.NET claims (nameidentifier, name, emailaddress, role) and `exp`; `RememberMe`
 * does not change the response (no cookie). Role values: `ولي أمر`, `أخصائي/ة`, `Admin`,
 * `SuperAdmin` (teacher `معلم/ة` seen in user lists). The parser reads that shape and keeps the JWT
 * claims only as a fallback. The JWT is decoded for display/routing only — never trusted.
 */
const TOKEN_KEYS = ['token', 'accessToken', 'access_token', 'jwt'] as const;

const CLAIM = {
  role: ['role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
  name: [
    'fullName',
    'name',
    'unique_name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ],
  id: [
    'id',
    'userId',
    'sub',
    'nameid',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ],
  email: ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
} as const;

const MS_PER_SECOND = 1000;

type Json = Record<string, unknown>;

function asRecord(value: unknown): Json | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Json)
    : null;
}

function firstString(source: Json | null, keys: readonly string[]): string | null {
  if (!source) return null;
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    // Role claims may be arrays; take the first known role.
    if (Array.isArray(value)) {
      const items: unknown[] = value;
      const known = items.find(
        (item): item is string => typeof item === 'string' && normalizeRole(item) !== null,
      );
      if (known) return known;
    }
  }
  return null;
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

function unexpected(): AppError {
  return new AppError('تعذّر إكمال تسجيل الدخول: استجابة غير متوقعة من الخادم.', {
    kind: 'unknown',
    code: 'UNEXPECTED_LOGIN_RESPONSE',
  });
}

export function parseLoginResponse(data: unknown): Session {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root;
  const userObject = asRecord(body?.user);
  const accessToken =
    firstString(body, TOKEN_KEYS) ??
    (typeof data === 'string' && data.split('.').length === 3 ? data : null);
  if (!accessToken) throw unexpected();

  const claims = decodeJwtPayload(accessToken);
  const pick = (keys: readonly string[]) =>
    firstString(userObject, keys) ?? firstString(body, keys) ?? firstString(claims, keys);

  const role = normalizeRole(pick(CLAIM.role));
  if (!role) {
    throw new AppError('لم نتمكن من تحديد صلاحية هذا الحساب. تواصل مع إدارة المنصة.', {
      kind: 'unknown',
      code: 'UNKNOWN_ROLE',
    });
  }

  const exp = claims?.exp;
  return {
    accessToken,
    user: {
      id: pick(CLAIM.id),
      name: pick(CLAIM.name) ?? pick(CLAIM.email) ?? '',
      email: pick(CLAIM.email),
      role,
    },
    expiresAt: typeof exp === 'number' ? exp * MS_PER_SECOND : null,
  };
}
