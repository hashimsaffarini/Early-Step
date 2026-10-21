import type { AssessmentCategory, AssessmentQuestion } from '../types';

import { belongsTo, categoryProgress, isAnswerable, questionsInScope } from './assessmentRun';

function question(overrides: Partial<AssessmentQuestion>): AssessmentQuestion {
  return {
    id: 'q',
    text: 'سؤال',
    imageUrl: null,
    type: 'SingleChoice',
    options: [{ id: 'o', text: 'أ', imageUrl: null }],
    sectionTitle: null,
    categoryId: null,
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

  describe('category scopes (client revision 2026-10)', () => {
    const reading: AssessmentCategory = {
      id: 'cat-r',
      name: 'القراءة',
      description: null,
      iconUrl: null,
    };
    const questions = [
      question({ id: 'r1', categoryId: 'cat-r', sectionTitle: 'القراءة' }),
      question({ id: 'm1', categoryId: 'cat-m', sectionTitle: 'الرياضيات' }),
      question({ id: 'r2', categoryId: 'cat-r', sectionTitle: 'القراءة' }),
    ];

    it('groups the real start response by category id, falling back to the name', () => {
      expect(belongsTo(question({ categoryId: 'cat-r' }), reading)).toBe(true);
      expect(belongsTo(question({ categoryId: 'cat-x', sectionTitle: 'القراءة' }), reading)).toBe(
        false,
      );
      expect(belongsTo(question({ sectionTitle: 'القراءة' }), reading)).toBe(true);
    });

    it('plays only the open questions of one category, or of all of them', () => {
      const none = new Set<string>();
      expect(
        questionsInScope(questions, { kind: 'category', category: reading }, none).map((q) => q.id),
      ).toEqual(['r1', 'r2']);
      expect(
        questionsInScope(questions, { kind: 'all' }, new Set(['r1'])).map((q) => q.id),
      ).toEqual(['m1', 'r2']);
    });

    it('counts a category’s done questions', () => {
      expect(categoryProgress(questions, reading, new Set(['r2', 'm1']))).toEqual({
        total: 2,
        done: 1,
      });
    });
  });
});
