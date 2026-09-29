import { CircleCheck, Hourglass, Target, type LucideIcon } from 'lucide-react';

import type { ChildGender, ChildJourneyStatus } from '@/types/child';

type StatusTone = 'primary' | 'success' | 'warning';
type AvatarTone = 'primary' | 'violet' | 'warning';

/** Arabic display for child journey statuses — shared by dashboards and children screens. */
export const CHILD_STATUS_DISPLAY: Record<
  ChildJourneyStatus,
  { label: string; tone: StatusTone; icon: LucideIcon; avatarTone: AvatarTone }
> = {
  'training-plan-active': {
    label: 'لديه خطة تدريبية',
    tone: 'primary',
    icon: Target,
    avatarTone: 'primary',
  },
  'assessment-completed': {
    label: 'التقييم المبدئي مكتمل',
    tone: 'success',
    icon: CircleCheck,
    avatarTone: 'violet',
  },
  'assessment-pending': {
    label: 'بانتظار بدء التقييم',
    tone: 'warning',
    icon: Hourglass,
    avatarTone: 'warning',
  },
};

export const CHILD_GENDER_LABELS: Record<ChildGender, string> = {
  boy: 'ولد',
  girl: 'بنت',
};
