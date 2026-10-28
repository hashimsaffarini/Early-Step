import { rememberQuestionContent } from '@/services/api/questionContentCache';
import { parseCategoriesResponse, parseStartResponse } from './assessmentApi';

describe('parseStartResponse (live contract 2026-10-14)', () => {
  it('reads questions grouped under categories', () => {
    const result = parseStartResponse({
      assessmentId: 'as-1',
      categories: [
        {
          id: 'cat-1',
          name: 'القراءة',
          questions: [
            {
              id: 'q1',
              questionText: 'سؤال',
              questionImageUrl: '/uploads/q1.png',
              type: 'SingleChoice',
              options: [{ id: 'o1', optionText: 'أ', optionImageUrl: null }],
            },
          ],
        },
      ],
    });

    expect(result.assessmentId).toBe('as-1');
    expect(result.questions).toEqual([
      {
        id: 'q1',
        text: 'سؤال',
        imageUrl: '/uploads/q1.png',
        type: 'SingleChoice',
        options: [{ id: 'o1', text: 'أ', imageUrl: null }],
        sectionTitle: 'القراءة',
        categoryId: 'cat-1',
      },
    ]);
  });

  it('rejects the old guessed shapes (flat questions, `data` wrapper, `id`, message-only body)', () => {
    expect(() =>
      parseStartResponse({ data: { id: 'as-2', questions: [{ id: 'q1', type: 'SingleChoice' }] } }),
    ).toThrow('استجابة غير متوقعة');
    expect(() => parseStartResponse({ message: 'الطفل غير موجود.' })).toThrow('استجابة غير متوقعة');
  });

  it('fails clearly on an unexpected body', () => {
    expect(() => parseStartResponse('ok')).toThrow('استجابة غير متوقعة');
  });
});

describe('parseCategoriesResponse (live contract 2026-10-16)', () => {
  it('reads the assessment categories in server order, without inventing details', () => {
    expect(
      parseCategoriesResponse({
        categories: [
          { id: 'b', name: 'ثانٍ', order: 2 },
          { id: 'a', name: ' أول ', order: 1, description: 'وصف', iconUrl: '/uploads/a.png' },
        ],
      }),
    ).toEqual([
      { id: 'a', name: 'أول', description: 'وصف', iconUrl: '/uploads/a.png' },
      { id: 'b', name: 'ثانٍ', description: null, iconUrl: null },
    ]);
    expect(parseCategoriesResponse({ categories: [] })).toEqual([]);
  });

  it('rejects an unexpected shape', () => {
    expect(() => parseCategoriesResponse([{ id: 'a' }])).toThrow();
  });
});

describe('missing options with a previously observed local copy', () => {
  it('restores the real choice ids instead of inventing choices', () => {
    rememberQuestionContent({
      id: 'q-real',
      text: 'ما الحرف الأول؟',
      type: 'SingleChoice',
      imageUrl: null,
      options: [
        { id: 'real-d', text: 'د', imageUrl: null },
        { id: 'real-b', text: 'ب', imageUrl: null },
      ],
    });
    const result = parseStartResponse({
      assessmentId: 'as-1',
      categories: [
        {
          name: 'القراءة',
          questions: [
            { id: 'q-real', questionText: 'ما الحرف الأول؟', type: 'SingleChoice', options: [] },
          ],
        },
      ],
    });
    expect(result.questions[0]?.options.map((option) => option.id)).toEqual(['real-d', 'real-b']);
    expect(result.questions[0]?.isLocalContent).toBe(true);
  });
  it('prefers current server options and never reuses another question or another type', () => {
    rememberQuestionContent({
      id: 'q-real',
      text: 'سؤال',
      type: 'SingleChoice',
      imageUrl: null,
      options: [{ id: 'old', text: 'قديم', imageUrl: null }],
    });
    const parsed = parseStartResponse({
      assessmentId: 'as-1',
      categories: [
        {
          questions: [
            { id: 'q-real', type: 'SingleChoice', options: [{ id: 'new', optionText: 'جديد' }] },
            { id: 'other', type: 'SingleChoice', options: [] },
            { id: 'q-real', type: 'Sequence', options: [] },
          ],
        },
      ],
    });
    expect(parsed.questions.map((question) => question.options.map((option) => option.id))).toEqual(
      [['new'], [], []],
    );
  });
});
