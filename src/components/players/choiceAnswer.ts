/**
 * Answers for the backend's question types, shared by the initial assessment and the training
 * plan player. Verified live 2026-10-14 on both `initial-assessment/{id}/answer` and
 * `TrainingPlan/…/submit`: SingleChoice → `selectedOptionId`; MultiSelect → `selectedOptionIds`
 * (correct only for exactly the correct set, order ignored); Sequence → `orderedOptionIds` (correct
 * only in exactly the right order). Matching does not exist in the backend.
 */
export const CHOICE_QUESTION_TYPES = ['SingleChoice', 'MultiSelect', 'Sequence'] as const;
export type ChoiceQuestionType = (typeof CHOICE_QUESTION_TYPES)[number];

export type ChoiceAnswer =
  | { questionId: string; selectedOptionId: string }
  | { questionId: string; selectedOptionIds: string[] }
  | { questionId: string; orderedOptionIds: string[] };

export const CHOICE_HINTS: Record<ChoiceQuestionType, string> = {
  SingleChoice: 'اختر إجابة واحدة.',
  MultiSelect: 'اختر كل الإجابات الصحيحة، ثم اضغط «التالي».',
  Sequence: 'اضغط على الخيارات بالترتيب الصحيح.',
};

export const CHOICE_TYPE_LABELS: Record<ChoiceQuestionType, string> = {
  SingleChoice: 'اختيار إجابة واحدة',
  MultiSelect: 'اختيار عدة إجابات',
  Sequence: 'ترتيب',
};

export function toChoiceQuestionType(value: string | null | undefined): ChoiceQuestionType | null {
  return CHOICE_QUESTION_TYPES.find((type) => type.toLowerCase() === value?.toLowerCase()) ?? null;
}

/** The selection after tapping an option: replace, toggle, or append in tap order. */
export function nextChoiceSelection(
  type: ChoiceQuestionType,
  selection: readonly string[],
  optionId: string,
): string[] {
  if (type === 'SingleChoice') return [optionId];
  if (type === 'MultiSelect') {
    return selection.includes(optionId)
      ? selection.filter((id) => id !== optionId)
      : [...selection, optionId];
  }
  return selection.includes(optionId) ? [...selection] : [...selection, optionId];
}

/** The answer for a selection, or null while it is incomplete (a Sequence needs every option). */
export function toChoiceAnswer(
  questionId: string,
  type: ChoiceQuestionType,
  optionCount: number,
  selection: readonly string[],
): ChoiceAnswer | null {
  const [first] = selection;
  if (first === undefined) return null;
  if (type === 'SingleChoice') return { questionId, selectedOptionId: first };
  if (type === 'MultiSelect') return { questionId, selectedOptionIds: [...selection] };
  return selection.length === optionCount ? { questionId, orderedOptionIds: [...selection] } : null;
}
