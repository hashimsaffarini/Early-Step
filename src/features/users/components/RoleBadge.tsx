import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/constants/roleLabels';
import type { UserRole } from '@/types/roles';

const ROLE_TONES: Record<UserRole, BadgeTone> = {
  Parent: 'primary',
  Teacher: 'success',
  Specialist: 'accent',
  Admin: 'warning',
  SuperAdmin: 'neutral',
};

export interface RoleBadgeProps {
  role: UserRole | null;
  /** Backend value, shown as-is when the role is not recognized. */
  roleValue: string;
}

export function RoleBadge({ role, roleValue }: RoleBadgeProps) {
  return (
    <Badge tone={role ? ROLE_TONES[role] : 'neutral'}>{role ? ROLE_LABELS[role] : roleValue}</Badge>
  );
}
