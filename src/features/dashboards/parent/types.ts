import type { LucideIcon } from 'lucide-react';

export type ActivityKind = 'assessment' | 'report' | 'plan';

/** Activity feed item (used by the admin dashboard's recent-activity card). */
export interface ParentActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  /** ISO date. */
  date: string;
}

export interface ParentTip {
  id: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'violet';
}

/** Dashboard counts from the API. `null` = still loading or unavailable. */
export interface ParentDashboardStats {
  children: number;
  planActivities: number | null;
  reports: number | null;
}
