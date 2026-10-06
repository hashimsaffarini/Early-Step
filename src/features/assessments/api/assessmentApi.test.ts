import { assertNotKnownFailure, parseStartResponse } from './assessmentApi';

describe('parseStartResponse (shape NOT LIVE-VERIFIED)', () => {
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

  it('accepts a flat question list under `data` with an `id`', () => {
    const result = parseStartResponse({
      data: { id: 'as-2', questions: [{ id: 'q1', questionText: 'x', type: 'multiselect' }] },
    });

    expect(result.assessmentId).toBe('as-2');
    expect(result.questions[0]?.type).toBe('MultiSelect');
    expect(result.questions[0]?.options).toEqual([]);
  });

  it('treats a message-only 200 body as a failure with the server message', () => {
    expect(() =>
      parseStartResponse({ message: 'الطفل غير موجود أو لا يوجد تقييم أولي متاح.' }),
    ).toThrow('الطفل غير موجود أو لا يوجد تقييم أولي متاح.');
  });

  it('fails clearly on an unexpected body', () => {
    expect(() => parseStartResponse('ok')).toThrow('استجابة غير متوقعة');
  });
});

describe('assertNotKnownFailure', () => {
  it('rejects the documented 200 failure messages only', () => {
    expect(() => {
      assertNotKnownFailure({ message: 'لا يمكن إرسال الإجابة.' });
    }).toThrow('لا يمكن إرسال الإجابة.');
    expect(() => {
      assertNotKnownFailure({ message: 'تم حفظ الإجابة.' });
    }).not.toThrow();
    expect(() => {
      assertNotKnownFailure(null);
    }).not.toThrow();
  });
});
