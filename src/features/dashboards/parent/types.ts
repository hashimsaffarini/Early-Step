import type { LucideIcon } from 'lucide-react';

export interface ParentTip {
  id: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'violet';
}

/** A count derived from per-child API calls: the number, or why there is none yet. */
export type DerivedCount = number | 'loading' | 'error';

/** Dashboard counts from the API (never placeholders). */
export interface ParentDashboardStats {
  children: number;
  planActivities: DerivedCount;
  childrenWithReport: DerivedCount;
}
