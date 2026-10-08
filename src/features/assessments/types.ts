/**
 * Initial assessment as returned by `POST initial-assessment/{childId}/start`.
 * ⚠️ NOT LIVE-VERIFIED: the start response is undocumented (Swagger has no schema; Apidog only
 * shows an Arabic failure message). See `api/assessmentApi.ts` for the accepted shapes.
 */
export type AssessmentQuestionType = 'SingleChoice' | 'MultiSelect' | 'Sequence';

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
}

export interface StartedAssessment {
  assessmentId: string;
  questions: readonly AssessmentQuestion[];
}
