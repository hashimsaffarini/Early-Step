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

export function countAnswerable(questions: readonly AssessmentQuestion[]): number {
  return questions.filter(isAnswerable).length;
}

/** Section headings in question order (consecutive questions share a section). */
export function listSections(questions: readonly AssessmentQuestion[]): string[] {
  const titles: string[] = [];
  for (const question of questions) {
    const title = question.sectionTitle;
    if (title && titles.at(-1) !== title) titles.push(title);
  }
  return titles;
}
