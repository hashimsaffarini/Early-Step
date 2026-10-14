import { z } from 'zod';

import { normalizeRole } from '@/constants/backendRoles';
import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import type { SessionUser } from '@/services/session';

/**
 * `GET Auth/me` ("AuthInfo") — VERIFIED LIVE 2026-10-14 for Parent, Specialist, Admin and Super
 * Admin: `200 { id, fullName, email, roles: string[] }` (roles as the login sends them: `ولي أمر`,
 * `أخصائي/ة`, `Admin`, `SuperAdmin`); 401 without a valid token.
 */
export const AUTH_ME_PATH = 'Auth/me';

const currentUserSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  roles: z.array(z.string()).nullish(),
});

export function mapCurrentUser(data: unknown): SessionUser {
  const dto = currentUserSchema.parse(data);
  // Fail closed: an account without a known role gets no area.
  const role = (dto.roles ?? []).map(normalizeRole).find((value) => value !== null);
  if (!role) {
    throw new AppError('لم نتمكن من تحديد صلاحية هذا الحساب. تواصل مع إدارة المنصة.', {
      kind: 'unknown',
      code: 'UNKNOWN_ROLE',
    });
  }
  const fullName = dto.fullName?.trim() ?? '';
  return {
    id: dto.id,
    name: fullName === '' ? (dto.email ?? '') : fullName,
    email: dto.email ?? null,
    role,
  };
}

/** The signed-in user. `accessToken` is passed at login, before the session is stored. */
export async function fetchCurrentUser(accessToken?: string): Promise<SessionUser> {
  const { data } = await httpClient.get<unknown>(
    AUTH_ME_PATH,
    accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  );
  return mapCurrentUser(data);
}
