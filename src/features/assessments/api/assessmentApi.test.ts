import { parseStartResponse } from './assessmentApi';

describe('parseStartResponse (live contract 2026-10-14)', () => {
  it('reads questions grouped under categories', () => {
    const result = parseStartResponse({
      assessmentId: 'as-1',
      categories: [
        {
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
