import type { LucideIcon } from 'lucide-react';

/** Neutral, non-diagnostic child status shown on the parent dashboard. */
export type ChildJourneyStatus =
  'assessment-pending' | 'assessment-completed' | 'training-plan-active';

export interface ParentChildSummary {
  id: string;
  name: string;
  ageYears: number;
  status: ChildJourneyStatus;
  latestAssessmentLabel: string;
  /** Present only when a training plan exists: completed / total activities. */
  planProgress?: { completed: number; total: number };
}

export interface ParentDashboardStats {
  children: number;
  completedAssessments: number;
  trainingPlans: number;
  reports: number;
}

export type ActivityKind = 'assessment' | 'report' | 'plan';

export interface ParentActivityItem {
  id: string;
  kind: ActivityKind;
  title: string;
  description: string;
  /** ISO date (mock). */
  date: string;
}

export interface ParentTip {
  id: string;
  title: string;
  text: string;
  icon: LucideIcon;
  tone: 'primary' | 'success' | 'violet';
}
