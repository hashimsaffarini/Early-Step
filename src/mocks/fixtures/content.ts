/**
 * TEMPORARY MOCK DATA — admin content (categories, activities, questions, options, initial
 * assessment). Fictional; shapes follow the Apidog examples (NOT LIVE-VERIFIED).
 */
import { registerMockTable } from '../db';

export interface MockCategoryRow {
  id: string;
  name: string;
  isDeleted: boolean;
  isInInitialAssessment: boolean;
}

export interface MockOptionRow {
  id: string;
  optionText: string | null;
  optionImageUrl: string | null;
  isCorrect: boolean;
  order: number;
  correctOrder: number | null;
}

export interface MockQuestionRow {
  id: string;
  activityId: string;
  questionText: string;
  questionImageUrl: string | null;
  type: string;
  order: number;
  options: MockOptionRow[];
}

export interface MockActivityRow {
  id: string;
  type: 'test' | 'game';
  title: string;
  description: string;
  slug: string;
  iconUrl: string | null;
  categoryId: string;
  createdById: string;
  createdByName: string;
}

const CAT_READING = 'cat00000-0000-4000-8000-000000000001';
const CAT_MATH = 'cat00000-0000-4000-8000-000000000002';
const CAT_MEMORY = 'cat00000-0000-4000-8000-000000000003';

const INITIAL_CATEGORIES: readonly MockCategoryRow[] = [
  { id: CAT_READING, name: 'الحروف والقراءة', isDeleted: false, isInInitialAssessment: true },
  { id: CAT_MATH, name: 'الأرقام والحساب', isDeleted: false, isInInitialAssessment: false },
  { id: CAT_MEMORY, name: 'الذاكرة والتسلسل', isDeleted: false, isInInitialAssessment: false },
];

const INITIAL_ACTIVITIES: readonly MockActivityRow[] = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    type: 'test',
    title: 'اختبار الحروف',
    description: 'أسئلة بسيطة عن الحروف.',
    slug: 'letters-test',
    iconUrl: null,
    categoryId: CAT_READING,
    createdById: 'u-admin',
    createdByName: 'خالد سعيد',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    type: 'test',
    title: 'اختبار الأعداد',
    description: 'جمع وطرح بسيط.',
    slug: 'numbers-test',
    iconUrl: null,
    categoryId: CAT_MATH,
    createdById: 'u-admin',
    createdByName: 'خالد سعيد',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    type: 'game',
    title: 'لعبة الذاكرة',
    description: 'تذكّر ترتيب الصور.',
    slug: 'memory-game',
    iconUrl: null,
    categoryId: CAT_MEMORY,
    createdById: 'u-admin',
    createdByName: 'خالد سعيد',
  },
];

const INITIAL_QUESTIONS: readonly MockQuestionRow[] = [
  {
    id: 'q0000000-0000-4000-8000-000000000001',
    activityId: 'a0000000-0000-4000-8000-000000000001',
    questionText: 'أي كلمة تبدأ بحرف الباء؟',
    questionImageUrl: null,
    type: 'SingleChoice',
    order: 1,
    options: [
      {
        id: 'o0000000-0000-4000-8000-000000000001',
        optionText: 'بطة',
        optionImageUrl: null,
        isCorrect: true,
        order: 1,
        correctOrder: null,
      },
      {
        id: 'o0000000-0000-4000-8000-000000000002',
        optionText: 'تفاحة',
        optionImageUrl: null,
        isCorrect: false,
        order: 2,
        correctOrder: null,
      },
    ],
  },
  {
    id: 'q0000000-0000-4000-8000-000000000002',
    activityId: 'a0000000-0000-4000-8000-000000000001',
    questionText: 'رتّب حروف كلمة «قمر».',
    questionImageUrl: null,
    type: 'Sequence',
    order: 2,
    options: [
      {
        id: 'o0000000-0000-4000-8000-000000000003',
        optionText: 'م',
        optionImageUrl: null,
        isCorrect: false,
        order: 1,
        correctOrder: 2,
      },
      {
        id: 'o0000000-0000-4000-8000-000000000004',
        optionText: 'ق',
        optionImageUrl: null,
        isCorrect: false,
        order: 2,
        correctOrder: 1,
      },
      {
        id: 'o0000000-0000-4000-8000-000000000005',
        optionText: 'ر',
        optionImageUrl: null,
        isCorrect: false,
        order: 3,
        correctOrder: 3,
      },
    ],
  },
];

export const mockCategories: MockCategoryRow[] = [];
export const mockActivities: MockActivityRow[] = [];
export const mockQuestions: MockQuestionRow[] = [];
/** Question ids added to the initial assessment (the API cannot list them). */
export const mockAssessmentQuestionIds = new Set<string>();

registerMockTable(() => {
  mockCategories.splice(0, mockCategories.length, ...INITIAL_CATEGORIES.map((row) => ({ ...row })));
  mockActivities.splice(0, mockActivities.length, ...INITIAL_ACTIVITIES.map((row) => ({ ...row })));
  mockQuestions.splice(
    0,
    mockQuestions.length,
    ...INITIAL_QUESTIONS.map((row) => ({
      ...row,
      options: row.options.map((option) => ({ ...option })),
    })),
  );
  mockAssessmentQuestionIds.clear();
});
