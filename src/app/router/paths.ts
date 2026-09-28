import type { UserRole } from '@/types/roles';

/**
 * Centralized route paths. Never hardcode path strings in components —
 * import them from here.
 *
 * Only routes that actually exist are listed. Role namespaces are declared
 * below for planning but have no pages yet.
 */
export const ROUTE_PATHS = {
  home: '/',
  unauthorized: '/unauthorized',
} as const;

/** Planned URL namespace for each role's area (pages TBD). */
export const ROLE_NAMESPACES = {
  Parent: '/parent',
  Teacher: '/teacher',
  Specialist: '/specialist',
  Admin: '/admin',
  SuperAdmin: '/super-admin',
} as const satisfies Record<UserRole, `/${string}`>;
