import type { AssessmentState } from '@/features/children/types';

/** Arabic labels + badge tone for assessment states (child profile). */
export const ASSESSMENT_STATE_DISPLAY: Record<
  AssessmentState,
  { label: string; tone: 'success' | 'warning' | 'primary' }
> = {
  completed: { label: 'مكتمل', tone: 'success' },
  'in-progress': { label: 'قيد التنفيذ', tone: 'primary' },
  'not-started': { label: 'لم يبدأ بعد', tone: 'warning' },
};

export function countCompleted(items: readonly { isCompleted: boolean }[]): number {
  return items.filter((item) => item.isCompleted).length;
}

export function formatActivityProgress(completed: number, total: number): string {
  return `${completed} من ${total} أنشطة`;
}
