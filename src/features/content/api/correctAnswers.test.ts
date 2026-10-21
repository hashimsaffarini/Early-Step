import type { Question } from '../types';

import { currentSequence, planCorrectAnswerUpdates } from './correctAnswers';

function question(
  type: Question['type'],
  options: Partial<Question['options'][number]>[],
): Question {
  return {
    id: 'q',
    text: 'سؤال',
    imageUrl: null,
    type,
    order: null,
    options: options.map((option, index) => ({
      id: `o${(index + 1).toString()}`,
      text: `خيار ${(index + 1).toString()}`,
      imageUrl: null,
      isCorrect: false,
      order: 0,
      correctOrder: null,
      ...option,
    })),
  };
}

describe('planCorrectAnswerUpdates (live rules 2026-10-16)', () => {
  it('SingleChoice: unsets the old answer first, then sets the new one, with positional orders', () => {
    const q = question('SingleChoice', [{ isCorrect: true }, {}, {}]);
    const plan = planCorrectAnswerUpdates(q, { kind: 'choice', correctIds: ['o3'] });
    expect(plan.map((step) => [step.optionId, step.input.isCorrect, step.input.order])).toEqual([
      ['o1', false, 1],
      ['o3', true, 3],
    ]);
    // Text kept, image kept (null = not sent).
    expect(plan[0]?.input).toMatchObject({ text: 'خيار 1', image: null, correctOrder: null });
  });

  it('MultiSelect: sends only the options whose correctness changes', () => {
    const q = question('MultiSelect', [{ isCorrect: true }, { isCorrect: true }, {}]);
    const plan = planCorrectAnswerUpdates(q, { kind: 'choice', correctIds: ['o2', 'o3'] });
    expect(plan.map((step) => [step.optionId, step.input.isCorrect])).toEqual([
      ['o1', false],
      ['o3', true],
    ]);
  });

  it('Sequence: sets CorrectOrder from the chosen order and skips unchanged options', () => {
    const q = question('Sequence', [{ correctOrder: 1 }, { correctOrder: 2 }, { correctOrder: 3 }]);
    const plan = planCorrectAnswerUpdates(q, { kind: 'sequence', orderedIds: ['o3', 'o2', 'o1'] });
    expect(
      plan.map((step) => [step.optionId, step.input.correctOrder, step.input.isCorrect]),
    ).toEqual([
      ['o1', 3, false],
      ['o3', 1, false],
    ]);
  });

  it('reads the current Sequence order (options without one last)', () => {
    const q = question('Sequence', [
      { correctOrder: 2 },
      { correctOrder: null },
      { correctOrder: 1 },
    ]);
    expect(currentSequence(q)).toEqual(['o3', 'o1', 'o2']);
  });
});
