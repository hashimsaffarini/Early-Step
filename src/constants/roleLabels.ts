import type { UserRole } from '@/types/roles';

/** Arabic display labels for backend role values. */
export const ROLE_LABELS = {
  Parent: 'ولي الأمر',
  Teacher: 'المعلم',
  Specialist: 'الأخصائي',
  Admin: 'المدير',
  SuperAdmin: 'المدير العام',
} as const satisfies Record<UserRole, string>;
