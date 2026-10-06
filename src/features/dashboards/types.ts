import type { LucideIcon } from 'lucide-react';

import type { StatCardTone } from '@/components/shared/StatCard';

export interface DashboardStat {
  /** Server field name (stable React key). */
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatCardTone;
}
