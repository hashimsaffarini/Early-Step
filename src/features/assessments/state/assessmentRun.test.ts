import type { AssessmentQuestion } from '../types';

import { countAnswerable, isAnswerable, listSections } from './assessmentRun';

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
  it('only single-choice questions with options are answerable', () => {
    expect(isAnswerable(question({}))).toBe(true);
    expect(isAnswerable(question({ type: 'MultiSelect' }))).toBe(false);
    expect(isAnswerable(question({ options: [] }))).toBe(false);
    expect(isAnswerable(question({ type: null }))).toBe(false);
    expect(countAnswerable([question({}), question({ type: 'Sequence' })])).toBe(1);
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
