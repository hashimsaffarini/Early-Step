import type { UserRole } from '@/types/roles';

/**
 * Backend role values → the frontend's canonical `UserRole`.
 *
 * VERIFIED LIVE (2026-10-15, `Auth/me`, user lists, chat contacts): exactly `ولي أمر`, `معلم/ة`,
 * `أخصائي/ة`, `Admin`, `SuperAdmin`. Anything else normalizes to `null` and the user gets no
 * role-specific access (fail closed).
 */
const ROLE_ALIASES: Record<UserRole, readonly string[]> = {
  Parent: ['ولي أمر'],
  Teacher: ['معلم/ة'],
  Specialist: ['أخصائي/ة'],
  Admin: ['Admin'],
  SuperAdmin: ['SuperAdmin'],
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
