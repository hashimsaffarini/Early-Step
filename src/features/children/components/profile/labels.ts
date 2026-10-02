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

export const ASSIGN_ACTIVITY_LABEL = 'تعيين نشاط جديد';

const FEW_MIN = 3;
const FEW_MAX = 10;

/** Arabic count phrase for activities ("نشاط واحد", "نشاطان", "3 أنشطة", "11 نشاط"). */
export function formatActivityCount(count: number): string {
  if (count === 1) return 'نشاط واحد';
  if (count === 2) return 'نشاطان';
  if (count >= FEW_MIN && count <= FEW_MAX) return `${count.toString()} أنشطة`;
  return `${count.toString()} نشاط`;
}
