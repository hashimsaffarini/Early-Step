import type { PlanActivity } from '@/services/api/childPlan';

/**
 * Status and call-to-action wording for a plan activity (client revisions 2026-11):
 * games stay replayable («مكتملة» + «العب مرة أخرى»); a completed test is done — it has no retry
 * (the plan has no repeat for tests). A replayed game is never submitted again.
 */
export function statusLabel(activity: PlanActivity): string {
  if (!activity.isCompleted) return 'لم يكتمل بعد';
  return activity.type === 'game' ? 'مكتملة' : 'مكتمل';
}

/** Games are always replayable; a test opens only until it is completed. */
export function canPlay(activity: PlanActivity): boolean {
  return activity.type === 'game' || !activity.isCompleted;
}

export function playLabel(activity: PlanActivity): string {
  if (activity.type === 'game') return activity.isCompleted ? 'العب مرة أخرى' : 'ابدأ اللعب';
  return 'ابدأ';
}

/** Staff views (no play link): what the child can still do with a completed activity. */
export function availabilityHint(activity: PlanActivity): string | null {
  if (!activity.isCompleted || activity.type !== 'game') return null;
  return 'يمكن للطفل اللعب مرة أخرى';
}
