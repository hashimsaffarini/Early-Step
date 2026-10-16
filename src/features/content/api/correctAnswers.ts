import type { Question, QuestionOption } from '../types';

import type { OptionUpdateInput } from './contentApi';

/**
 * The admin's choice of correct answers for one question:
 * - SingleChoice / MultiSelect: the ids of the correct options;
 * - Sequence: the option ids in the correct order.
 */
export type CorrectAnswerChoice =
  | { kind: 'choice'; correctIds: readonly string[] }
  | { kind: 'sequence'; orderedIds: readonly string[] };

export interface OptionUpdate {
  optionId: string;
  input: OptionUpdateInput;
}

/**
 * Turns the admin's choice into `PUT Admin/question-options/{id}` calls (VERIFIED LIVE 2026-10-16):
 * - `Order` is required on every update and must be unique in the question; the backend does not
 *   store it (options read back with `order: 0`), so each option is sent with its display position
 *   (1…n) — the order the admin sees.
 * - A SingleChoice question refuses a second correct option ("قم بإلغاء الإجابة الصحيحة القديمة
 *   أولاً"), so options that stop being correct are sent first.
 * - Only options whose correctness changes are sent; text and image are kept (no image = keep).
 */
export function planCorrectAnswerUpdates(
  question: Question,
  choice: CorrectAnswerChoice,
): OptionUpdate[] {
  const position = new Map(question.options.map((option, index) => [option.id, index + 1]));
  const update = (option: QuestionOption, isCorrect: boolean, correctOrder: number | null) => ({
    optionId: option.id,
    input: {
      text: option.text,
      image: null,
      order: position.get(option.id) ?? 1,
      isCorrect,
      correctOrder,
    },
  });

  if (choice.kind === 'sequence') {
    return question.options.flatMap((option) => {
      const index = choice.orderedIds.indexOf(option.id);
      const correctOrder = index >= 0 ? index + 1 : null;
      return correctOrder === option.correctOrder ? [] : [update(option, false, correctOrder)];
    });
  }

  const correct = new Set(choice.correctIds);
  const changed = question.options.filter((option) => option.isCorrect !== correct.has(option.id));
  const unset = changed.filter((option) => option.isCorrect);
  const set = changed.filter((option) => !option.isCorrect);
  return [
    ...unset.map((option) => update(option, false, null)),
    ...set.map((option) => update(option, true, null)),
  ];
}

/** Current correct order of a Sequence question (options without one go last, in display order). */
export function currentSequence(question: Question): string[] {
  return [...question.options]
    .map((option, index) => ({ option, index }))
    .sort(
      (a, b) =>
        (a.option.correctOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.option.correctOrder ?? Number.MAX_SAFE_INTEGER) || a.index - b.index,
    )
    .map(({ option }) => option.id);
}
