/**
 * TEMPORARY MOCK DATA — training-plan activities per child (Apidog add-response shape) and the
 * activity catalogue a specialist can assign from (Apidog available-activities shape).
 */
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
  /** Activity slug (game template). Requested from the backend — NOT returned live yet. */
  slug?: string;
}

const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
const NOUR = 'c0000000-0000-4000-8000-000000000002';

/** Mock game rows (one per game template) so the game engines can be reviewed in mock mode. */
function gameRow(order: number, slug: string, title: string, description: string) {
  return {
    id: `p0000000-0000-4000-8000-00000000010${order.toString()}`,
    childId: NOUR,
    activityId: `g0000000-0000-4000-8000-00000000000${order.toString()}`,
    title,
    description,
    iconUrl: null,
    type: 'ألعاب',
    order,
    assignedAt: '2026-10-20T09:00:00Z',
    score: null,
    correctAnswers: null,
    wrongAnswers: null,
    isCompleted: false,
    completedAt: null,
    slug,
  };
}

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
    score: 75,
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
  gameRow(1, 'letter-hunt', 'صيد الحروف', 'اصطد الحرف الصحيح.'),
  gameRow(2, 'number-match', 'طابق الرقم', 'اختر الرقم المناسب.'),
  gameRow(3, 'memory-sequence', 'تحدي الذاكرة', 'رتّب البطاقات بالترتيب الصحيح.'),
  gameRow(4, 'focus-challenge', 'تحدي التركيز', 'اختر كل البطاقات المطلوبة.'),
];

export const mockPlanActivities: MockPlanActivityRow[] = [];

registerMockTable(() => {
  mockPlanActivities.splice(0, mockPlanActivities.length, ...INITIAL.map((row) => ({ ...row })));
});

/** Catalogue activities (what `available-activities` lists). Type uses the Arabic wire value. */
export interface MockCatalogActivity {
  id: string;
  title: string;
  description: string;
  type: 'اختبارات' | 'ألعاب';
  categoryId: string;
  categoryName: string;
  questionCount: number;
}

export const MOCK_CATALOG_ACTIVITIES: readonly MockCatalogActivity[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    title: 'اختبار الحروف',
    description: 'أسئلة بسيطة عن الحروف.',
    type: 'اختبارات',
    categoryId: 'cat-reading',
    categoryName: 'الحروف والقراءة',
    questionCount: 4,
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    title: 'اختبار الأعداد',
    description: 'جمع وطرح بسيط.',
    type: 'اختبارات',
    categoryId: 'cat-math',
    categoryName: 'الأرقام والحساب',
    questionCount: 4,
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    title: 'اختبار الذاكرة القصيرة',
    description: 'تذكّر الأشكال والألوان.',
    type: 'اختبارات',
    categoryId: 'cat-memory',
    categoryName: 'الذاكرة والتسلسل',
    questionCount: 3,
  },
  {
    id: 'a0000000-0000-4000-8000-000000000004',
    title: 'مطابقة البطاقات',
    description: 'اقلب البطاقات وطابق الصور.',
    type: 'ألعاب',
    categoryId: 'cat-memory',
    categoryName: 'الذاكرة والتسلسل',
    questionCount: 6,
  },
];
