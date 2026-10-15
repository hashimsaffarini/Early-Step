import { nextChoiceSelection, toChoiceAnswer, toChoiceQuestionType } from './choiceAnswer';

describe('choice answers (live contract 2026-10-14)', () => {
  it('builds one payload field per type', () => {
    expect(toChoiceAnswer('q', 'SingleChoice', 2, ['a'])).toEqual({
      questionId: 'q',
      selectedOptionId: 'a',
    });
    expect(toChoiceAnswer('q', 'MultiSelect', 3, ['b', 'a'])).toEqual({
      questionId: 'q',
      selectedOptionIds: ['b', 'a'],
    });
    expect(toChoiceAnswer('q', 'Sequence', 3, ['c', 'a', 'b'])).toEqual({
      questionId: 'q',
      orderedOptionIds: ['c', 'a', 'b'],
    });
  });

  it('waits for a selection, and for every option of a sequence', () => {
    expect(toChoiceAnswer('q', 'MultiSelect', 3, [])).toBeNull();
    expect(toChoiceAnswer('q', 'Sequence', 3, ['a', 'b'])).toBeNull();
  });

  it('replaces, toggles or appends in tap order', () => {
    expect(nextChoiceSelection('SingleChoice', ['a'], 'b')).toEqual(['b']);
    expect(nextChoiceSelection('MultiSelect', ['a', 'b'], 'a')).toEqual(['b']);
    expect(nextChoiceSelection('Sequence', ['b'], 'a')).toEqual(['b', 'a']);
    expect(nextChoiceSelection('Sequence', ['b', 'a'], 'b')).toEqual(['b', 'a']);
  });

  it('knows only the backend types (no Matching)', () => {
    expect(toChoiceQuestionType('multiselect')).toBe('MultiSelect');
    expect(toChoiceQuestionType('Matching')).toBeNull();
  });
});
