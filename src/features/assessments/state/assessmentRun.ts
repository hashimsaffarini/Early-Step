import type { AssessmentQuestion } from '../types';

const ANSWERABLE_TYPES: readonly (AssessmentQuestion['type'] & string)[] = [
  'SingleChoice',
  'MultiSelect',
  'Sequence',
];

/**
 * Verified live 2026-10-14: every type is answered once, with its own payload (`ChoiceAnswer`);
 * a second answer to the same question is rejected (400). `complete` requires every question to
 * be answered; only questions without options (or of an unknown type) cannot be answered.
 */
export function isAnswerable(question: AssessmentQuestion): boolean {
  return (
    question.type !== null &&
    ANSWERABLE_TYPES.includes(question.type) &&
    question.options.length > 0
  );
}
