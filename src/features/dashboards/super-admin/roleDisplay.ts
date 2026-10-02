import {
  BriefcaseMedical,
  Crown,
  GraduationCap,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import type { BadgeTone } from '@/components/ui/Badge';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { USER_ROLES, type UserRole } from '@/types/roles';

export interface RoleDisplay {
  label: string;
  icon: LucideIcon;
  badgeTone: BadgeTone;
}

/** Role pills and tiles in the super admin panel (one colour per role, label always shown). */
export const ROLE_DISPLAY: Record<UserRole, RoleDisplay> = {
  Parent: { label: ROLE_LABELS.Parent, icon: UserRound, badgeTone: 'primary' },
  Teacher: { label: ROLE_LABELS.Teacher, icon: GraduationCap, badgeTone: 'success' },
  Specialist: { label: ROLE_LABELS.Specialist, icon: BriefcaseMedical, badgeTone: 'accent' },
  Admin: { label: ROLE_LABELS.Admin, icon: ShieldCheck, badgeTone: 'warning' },
  SuperAdmin: { label: ROLE_LABELS.SuperAdmin, icon: Crown, badgeTone: 'neutral' },
};

export const ROLE_ORDER: readonly UserRole[] = USER_ROLES;
