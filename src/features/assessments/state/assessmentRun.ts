import type { AssessmentCategory, AssessmentQuestion } from '../types';

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

/** What the child chose to play: one category, or every category at once. */
export type AssessmentScope = { kind: 'all' } | { kind: 'category'; category: AssessmentCategory };

/**
 * A started question belongs to a category by the id the start response sent it under (live:
 * `categories[].id`); by the category name only when the response has no id.
 */
export function belongsTo(question: AssessmentQuestion, category: AssessmentCategory): boolean {
  if (question.categoryId !== null) return question.categoryId === category.id;
  return question.sectionTitle === category.name;
}

/** The questions still to play for a scope, in the server's order (done ones are left out). */
export function questionsInScope(
  questions: readonly AssessmentQuestion[],
  scope: AssessmentScope,
  done: ReadonlySet<string>,
): AssessmentQuestion[] {
  return questions.filter(
    (question) =>
      !done.has(question.id) && (scope.kind === 'all' || belongsTo(question, scope.category)),
  );
}

export interface CategoryProgress {
  total: number;
  done: number;
}

export function categoryProgress(
  questions: readonly AssessmentQuestion[],
  category: AssessmentCategory,
  done: ReadonlySet<string>,
): CategoryProgress {
  const own = questions.filter((question) => belongsTo(question, category));
  return { total: own.length, done: own.filter((question) => done.has(question.id)).length };
}
