import type { AssessmentQuestion } from '../types';

import { isAnswerable } from './assessmentRun';

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
  it('answers every known type that has options', () => {
    expect(isAnswerable(question({}))).toBe(true);
    expect(isAnswerable(question({ type: 'MultiSelect' }))).toBe(true);
    expect(isAnswerable(question({ type: 'Sequence' }))).toBe(true);
    expect(isAnswerable(question({ options: [] }))).toBe(false);
    expect(isAnswerable(question({ type: null }))).toBe(false);
  });
});
