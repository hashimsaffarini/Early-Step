import type { AssessmentQuestion } from '../types';

import {
  countAnswerable,
  isAnswerable,
  listSections,
  needsSingleAnswerHint,
} from './assessmentRun';

function question(overrides: Partial<AssessmentQuestion>): AssessmentQuestion {
  return {
    id: 'q',
    text: 'سؤال',
    imageUrl: null,
    type: 'SingleChoice',
    options: [{ id: 'o', text: 'أ', imageUrl: null }],
    sectionTitle: null,
    ...overrides,
  };
}

describe('assessment run helpers', () => {
  it('answers every known type with options through the single-option contract', () => {
    expect(isAnswerable(question({}))).toBe(true);
    expect(isAnswerable(question({ type: 'MultiSelect' }))).toBe(true);
    expect(isAnswerable(question({ type: 'Sequence' }))).toBe(true);
    expect(isAnswerable(question({ options: [] }))).toBe(false);
    expect(isAnswerable(question({ type: null }))).toBe(false);
    expect(countAnswerable([question({}), question({ type: 'Sequence', options: [] })])).toBe(1);
  });

  it('hints "one answer" only for types that look like they take several', () => {
    expect(needsSingleAnswerHint(question({}))).toBe(false);
    expect(needsSingleAnswerHint(question({ type: 'MultiSelect' }))).toBe(true);
    expect(needsSingleAnswerHint(question({ type: 'Sequence' }))).toBe(true);
  });

  it('lists section titles in order without repeats', () => {
    expect(
      listSections([
        question({ sectionTitle: 'القراءة' }),
        question({ sectionTitle: 'القراءة' }),
        question({ sectionTitle: 'الرياضيات' }),
        question({ sectionTitle: null }),
      ]),
    ).toEqual(['القراءة', 'الرياضيات']);
  });
});
