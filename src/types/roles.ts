/**
 * User roles as returned by the backend. These values are kept exactly as the
 * API sends them — never translate or rename them. Use `ROLE_LABELS` for UI.
 *
 * TBD: confirm exact casing/spelling against the API documentation.
 */
export const USER_ROLES = ['Parent', 'Teacher', 'Specialist', 'Admin', 'SuperAdmin'] as const;

export type UserRole = (typeof USER_ROLES)[number];
