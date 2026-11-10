import type { PlanActivity } from '@/services/api/childPlan';

/**
 * Status and call-to-action wording for a plan activity (client revision 2026-11):
 * games stay replayable («مكتملة» + «العب مرة أخرى»), tests can be reopened for practice
 * («مكتمل» + «إعادة المحاولة»). A reopened activity is never submitted again.
 */
export function statusLabel(activity: PlanActivity): string {
  if (!activity.isCompleted) return 'لم يكتمل بعد';
  return activity.type === 'game' ? 'مكتملة' : 'مكتمل';
}

export function playLabel(activity: PlanActivity): string {
  if (activity.type === 'game') return activity.isCompleted ? 'العب مرة أخرى' : 'ابدأ اللعب';
  return activity.isCompleted ? 'إعادة المحاولة' : 'ابدأ';
}

/** Staff views (no play link): what the child can still do with a completed activity. */
export function availabilityHint(activity: PlanActivity): string | null {
  if (!activity.isCompleted) return null;
  return activity.type === 'game'
    ? 'يمكن للطفل اللعب مرة أخرى'
    : 'يمكن للطفل إعادة فتحه للتدريب دون تغيير النتيجة';
}
