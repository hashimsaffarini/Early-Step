import type { LucideIcon } from 'lucide-react';

import type { StatCardTone } from '@/components/shared/StatCard';
import type { ChildGender, ChildJourneyStatus } from '@/types/child';
import type { UserRole } from '@/types/roles';

/** A child as staff dashboards and the super admin panel see it (display data only). */
export interface RosterChild {
  id: string;
  name: string;
  gender: ChildGender;
  /** ISO date (YYYY-MM-DD). */
  birthDate: string;
  status: ChildJourneyStatus;
  parentName: string;
  teacherName?: string;
  specialistName?: string;
  reportCount: number;
  /** ISO date of the latest report, when there is one. */
  lastReportDate?: string;
}

export interface RosterReport {
  id: string;
  childId: string;
  childName: string;
  title: string;
  /** ISO date. */
  date: string;
  authorName: string;
}

export interface RosterUser {
  id: string;
  name: string;
  /** Clearly fake placeholder address (`@example.test`). */
  email: string;
  role: UserRole;
}

export interface DashboardStat {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: StatCardTone;
}
