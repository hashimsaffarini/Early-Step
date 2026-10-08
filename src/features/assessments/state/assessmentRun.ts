import type { AssessmentQuestion } from '../types';

const ANSWERABLE_TYPES: readonly (AssessmentQuestion['type'] & string)[] = [
  'SingleChoice',
  'MultiSelect',
  'Sequence',
];

/**
 * Verified live 2026-10-08: every type is answered with ONE `{ questionId, selectedOptionId }`;
 * a second answer to the same question is rejected (400) and array payloads are not accepted.
 * The server scores the chosen option's `isCorrect`. `complete` requires every question to be
 * answered, so all types with options must be answerable; only questions without options (or of
 * an unknown type) cannot be answered.
 */
export function isAnswerable(question: AssessmentQuestion): boolean {
  return (
    question.type !== null &&
    ANSWERABLE_TYPES.includes(question.type) &&
    question.options.length > 0
  );
}

/** MultiSelect / Sequence look like they take several answers, but the server takes one. */
export function needsSingleAnswerHint(question: AssessmentQuestion): boolean {
  return question.type === 'MultiSelect' || question.type === 'Sequence';
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
