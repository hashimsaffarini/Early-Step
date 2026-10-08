import type { ActivityType } from '@/services/api/activityType';

/** Question types from Swagger (`QuestionType` enum). `Matching` was removed by the backend (2026-10-08: 400). */
export const QUESTION_TYPES = ['SingleChoice', 'MultiSelect', 'Sequence'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SingleChoice: 'اختيار إجابة واحدة',
  MultiSelect: 'اختيار عدة إجابات',
  Sequence: 'ترتيب',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  test: 'الاختبارات',
  game: 'الألعاب',
};

export interface Category {
  id: string;
  name: string;
  /** Number of activities, when the endpoint returns it. */
  count: number | null;
}

export interface CategoryWithCounts {
  id: string;
  name: string;
  count: number;
  isInInitialAssessment: boolean;
}

export interface ActivitySummary {
  id: string;
  title: string;
  description: string;
  slug: string;
  iconUrl: string | null;
  type: ActivityType | null;
  categoryId: string | null;
  categoryName: string | null;
  questionCount: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
  order: number | null;
  correctOrder: number | null;
}

export interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  type: QuestionType | null;
  order: number | null;
  options: QuestionOption[];
}

export interface ActivityDetail extends ActivitySummary {
  createdByName: string | null;
  questions: Question[];
}
