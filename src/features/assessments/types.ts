import type { ChoiceQuestionType } from '@/components/players';

/**
 * Initial assessment as returned by `POST initial-assessment/{childId}/start` (verified live:
 * `{ assessmentId, categories: [{ id, name, order, questions[] }] }`).
 */
export type AssessmentQuestionType = ChoiceQuestionType;

export interface AssessmentOption {
  id: string;
  text: string;
  imageUrl: string | null;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  /** Unknown types are kept as null and treated as not answerable. */
  type: AssessmentQuestionType | null;
  options: readonly AssessmentOption[];
  /** Category/section title when the response provides one. */
  sectionTitle: string | null;
  /** Id of the category the question was sent under (live: `categories[].id`). */
  categoryId: string | null;
}

/** A category of the initial assessment (`GET initial-assessment/categories`). */
export interface AssessmentCategory {
  id: string;
  name: string;
  /** Only when the server sends one (it does not today). */
  description: string | null;
  iconUrl: string | null;
}

export interface StartedAssessment {
  assessmentId: string;
  questions: readonly AssessmentQuestion[];
}
