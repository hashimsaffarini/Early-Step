import type { UserRole } from '@/types/roles';

/**
 * Backend role values → the frontend's canonical `UserRole`.
 *
 * Observed live (2026-10-06, user list): `ولي أمر`, `معلم/ة`, `أخصائي/ة`. English identifiers are
 * accepted too because ASP.NET Identity role claims may carry them (NOT LIVE-VERIFIED). The Arabic
 * wire values for Admin and SuperAdmin have not been observed yet — unknown values normalize to
 * `null` and the user gets no role-specific access (fail closed).
 */
const ROLE_ALIASES: Record<UserRole, readonly string[]> = {
  Parent: ['Parent', 'ولي أمر', 'ولي الأمر'],
  Teacher: ['Teacher', 'معلم/ة', 'معلم', 'معلمة'],
  Specialist: ['Specialist', 'أخصائي/ة', 'أخصائي', 'أخصائية'],
  Admin: ['Admin', 'Administrator'],
  SuperAdmin: ['SuperAdmin', 'Super Admin', 'Super_Admin'],
};

function canonical(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const LOOKUP = new Map<string, UserRole>(
  (Object.entries(ROLE_ALIASES) as [UserRole, readonly string[]][]).flatMap(([role, aliases]) =>
    aliases.map((alias) => [canonical(alias), role] as const),
  ),
);

/** Normalizes a backend role value; returns `null` for anything unknown. */
export function normalizeRole(value: unknown): UserRole | null {
  if (typeof value !== 'string') return null;
  return LOOKUP.get(canonical(value)) ?? null;
}

/** Role value sent by public parent registration (as observed on the wire). */
export const PARENT_REGISTRATION_ROLE = 'ولي أمر';
