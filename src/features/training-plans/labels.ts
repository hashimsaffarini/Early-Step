import { CircleCheck, CirclePause, CirclePlay, type LucideIcon } from 'lucide-react';

import type { PlanStatus } from './types';

/** Plan status: text + icon (never colour alone). */
export const PLAN_STATUS_DISPLAY: Record<
  PlanStatus,
  { label: string; tone: 'success' | 'primary' | 'warning'; icon: LucideIcon }
> = {
  active: { label: 'نشط', tone: 'success', icon: CirclePlay },
  completed: { label: 'مكتمل', tone: 'primary', icon: CircleCheck },
  paused: { label: 'موقوف مؤقتاً', tone: 'warning', icon: CirclePause },
};

/** Roles that can create plans (Replit: Specialist, Admin). Display only — not access control. */
export const PLAN_EDITOR_ROLES = ['Specialist', 'Admin'] as const;
