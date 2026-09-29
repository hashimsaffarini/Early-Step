import type { UserRole } from '@/types/roles';

/**
 * Centralized route paths. Never hardcode path strings in components —
 * import them from here. Lives in a shared layer so features can link to each
 * other's routes without importing `app/` (ADR-018).
 *
 * Only routes that actually exist are listed.
 */
export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  unauthorized: '/unauthorized',
} as const;

/** Development-only UI preview (not registered in production builds). */
export const DEV_PREVIEW_PATHS = {
  root: '/ui-preview',
  components: '/ui-preview/components',
  forms: '/ui-preview/forms',
  child: '/ui-preview/child',
} as const;

/** Planned URL namespace for each role's area (pages TBD). */
export const ROLE_NAMESPACES = {
  Parent: '/parent',
  Teacher: '/teacher',
  Specialist: '/specialist',
  Admin: '/admin',
  SuperAdmin: '/super-admin',
} as const satisfies Record<UserRole, `/${string}`>;
