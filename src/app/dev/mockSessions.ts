/**
 * TEMPORARY development mock — there is no authentication yet.
 * Each role area renders with one of these display-only users so the UI can be built.
 * Remove when real auth provides the signed-in user. Not a security boundary.
 * Names follow the shared mock roster documented in docs/UI_MIGRATION_MAP.md.
 */
import type { ShellUser } from '@/components/layout/navigation';
import { ROLE_LABELS } from '@/constants/roleLabels';
import type { UserRole } from '@/types/roles';

export const MOCK_SESSION_USERS = {
  Parent: { name: 'محمد أحمد', roleLabel: ROLE_LABELS.Parent },
  Teacher: { name: 'أ. سارة خالد', roleLabel: ROLE_LABELS.Teacher },
  Specialist: { name: 'أ. ليلى حسن', roleLabel: ROLE_LABELS.Specialist },
  Admin: { name: 'خالد سعيد', roleLabel: ROLE_LABELS.Admin },
  SuperAdmin: { name: 'عبدالله منصور', roleLabel: ROLE_LABELS.SuperAdmin },
} as const satisfies Record<UserRole, ShellUser>;
