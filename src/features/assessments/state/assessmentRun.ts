import type { AssessmentQuestion } from '../types';

/**
 * The answer contract is `{ questionId, selectedOptionId }` — a single option. Only single-choice
 * questions can be answered; MultiSelect / Sequence / Matching have no documented payload
 * (BLOCKED BY BACKEND) and are shown as not supported instead of inventing one.
 */
export function isAnswerable(question: AssessmentQuestion): boolean {
  return question.type === 'SingleChoice' && question.options.length > 0;
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
