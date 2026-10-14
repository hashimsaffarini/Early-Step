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
