export const PLAN_STATUSES = ['active', 'completed', 'paused'] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

/** Education plan (Replit "IEP") as shown on the plans page. UI model; API mapping TBD. */
export interface EducationPlan {
  id: string;
  title: string;
  status: PlanStatus;
  /** Absent for plans added locally in this session. */
  specialistName?: string;
  /** ISO dates. */
  startedAt: string;
  reviewDate?: string;
  goals: readonly string[];
  strategies: readonly string[];
  activitiesCompleted: number;
  activitiesTotal: number;
  notes?: string;
  /** Added in this session only (not saved). */
  isLocal?: boolean;
}

export interface PlanChild {
  id: string;
  name: string;
}
