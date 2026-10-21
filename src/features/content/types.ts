import {
  CHOICE_QUESTION_TYPES,
  CHOICE_TYPE_LABELS,
  type ChoiceQuestionType,
} from '@/components/players';
import type { ActivityType } from '@/services/api/activityType';

/** Question types from Swagger (`QuestionType` enum: no Matching, re-checked 2026-10-14). */
export const QUESTION_TYPES = CHOICE_QUESTION_TYPES;
export type QuestionType = ChoiceQuestionType;

export const QUESTION_TYPE_LABELS = CHOICE_TYPE_LABELS;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  test: 'الاختبارات',
  game: 'الألعاب',
};

/** One activity of a type (row badges). */
export const ACTIVITY_TYPE_SINGULAR: Record<ActivityType, string> = {
  test: 'اختبار',
  game: 'لعبة',
};

/** Create action per type («+ إضافة لعبة» on the games tab — client revision 2026-10). */
export const ADD_LABELS: Record<ActivityType, string> = {
  test: 'إضافة اختبار',
  game: 'إضافة لعبة',
};

export interface Category {
  id: string;
  name: string;
  /** Number of activities, when the endpoint returns it. */
  count: number | null;
}

/**
 * A category from `categoriesActivity`. Its `isInInitialAssessment` flag is not mapped: live it is
 * always false, so membership comes from `initial-assessment/categories` only.
 */
export interface CategoryWithCounts {
  id: string;
  name: string;
  /** Activities in the category; null when the server did not send it. */
  count: number | null;
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
  /** Null when the server did not send it (never shown as 0). */
  questionCount: number | null;
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
