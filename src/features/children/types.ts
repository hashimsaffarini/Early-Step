import type { ActivityCategory } from '@/constants/activityCategories';
import type { ChildGender, ChildJourneyStatus } from '@/types/child';

/** Child as shown on the children screens of every role (UI model; API mapping TBD). */
export interface ChildRecord {
  id: string;
  name: string;
  /** ISO date `YYYY-MM-DD` (Replit form uses a birth date; the API docs show "Age" — TBD). */
  birthDate: string;
  gender: ChildGender;
  status: ChildJourneyStatus;
  /** Shown to staff (teacher, specialist, admin); the parent's own list omits it. */
  parentName?: string;
}

export type AssessmentState = 'not-started' | 'in-progress' | 'completed';

export interface ChildAssessment {
  id: string;
  title: string;
  state: AssessmentState;
  /** ISO date when completed. */
  completedAt?: string;
  completedSections?: number;
  totalSections?: number;
}

export type PlanActivityType = 'test' | 'game';

export interface PlanActivity {
  /** Assignment id (unique within the child). */
  id: string;
  /** Game or test id — opens the player (`paths.gamePlay` / `paths.testPlay`). */
  activityId: string;
  title: string;
  type: PlanActivityType;
  category: ActivityCategory;
  emoji: string;
  isCompleted: boolean;
}

export interface ChildTrainingPlan {
  title: string;
  /** ISO date. */
  startedAt: string;
  specialistName: string;
  activities: readonly PlanActivity[];
}

export interface ChildReport {
  id: string;
  title: string;
  /** ISO date. */
  date: string;
  authorName: string;
  summary: string;
}

export type ChildEventKind = 'profile' | 'assessment' | 'plan' | 'report';

export interface ChildEvent {
  id: string;
  kind: ChildEventKind;
  title: string;
  /** ISO date. */
  date: string;
}

/** Everything the child profile shows beyond the basic child record. */
export interface ChildProfileDetails {
  assessments: readonly ChildAssessment[];
  plan?: ChildTrainingPlan;
  reports: readonly ChildReport[];
  events: readonly ChildEvent[];
}
