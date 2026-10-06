/** TEMPORARY MOCK DATA — training-plan activities per child (Apidog add-response shape). */
import { registerMockTable } from '../db';

export interface MockPlanActivityRow {
  id: string;
  childId: string;
  activityId: string;
  title: string;
  description: string;
  iconUrl: string | null;
  type: string;
  order: number;
  assignedAt: string;
  score: number | null;
  correctAnswers: number | null;
  wrongAnswers: number | null;
  isCompleted: boolean;
  completedAt: string | null;
}

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';

const INITIAL: readonly MockPlanActivityRow[] = [
  {
    id: 'p0000000-0000-4000-8000-000000000001',
    childId: YOUSEF,
    activityId: 'a0000000-0000-4000-8000-000000000001',
    title: 'اختبار الحروف',
    description: 'أسئلة بسيطة عن الحروف.',
    iconUrl: null,
    type: 'اختبارات',
    order: 1,
    assignedAt: '2026-09-26T09:00:00Z',
    score: null,
    correctAnswers: 3,
    wrongAnswers: 1,
    isCompleted: true,
    completedAt: '2026-09-27T09:00:00Z',
  },
  {
    id: 'p0000000-0000-4000-8000-000000000002',
    childId: YOUSEF,
    activityId: 'a0000000-0000-4000-8000-000000000002',
    title: 'اختبار الأعداد',
    description: 'جمع وطرح بسيط.',
    iconUrl: null,
    type: 'اختبارات',
    order: 2,
    assignedAt: '2026-09-26T09:00:00Z',
    score: null,
    correctAnswers: null,
    wrongAnswers: null,
    isCompleted: false,
    completedAt: null,
  },
];

export const mockPlanActivities: MockPlanActivityRow[] = [];

registerMockTable(() => {
  mockPlanActivities.splice(0, mockPlanActivities.length, ...INITIAL.map((row) => ({ ...row })));
});
