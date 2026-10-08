import { activitySchema, questionSchema } from './contentForms';

const option = (
  overrides: Partial<{
    text: string;
    isCorrect: boolean;
    correctOrder: string;
  }> = {},
) => ({
  text: 'خيار',
  image: null,
  isCorrect: false,
  correctOrder: '',
  ...overrides,
});

function messages(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues.map((issue) => issue.message) ?? [];
}

describe('questionSchema', () => {
  it('requires exactly one correct answer for single choice', () => {
    const result = questionSchema.safeParse({
      text: 'س',
      image: null,
      type: 'SingleChoice',
      options: [option({ isCorrect: true }), option({ isCorrect: true })],
    });
    expect(messages(result)).toContain('حدّد إجابة صحيحة واحدة فقط');
  });

  it('requires a complete 1..n order for sequence questions', () => {
    const result = questionSchema.safeParse({
      text: 'س',
      image: null,
      type: 'Sequence',
      options: [option({ correctOrder: '1' }), option({ correctOrder: '1' })],
    });
    expect(messages(result)[0]).toMatch(/رتّب الخيارات/);

    expect(
      questionSchema.safeParse({
        text: 'س',
        image: null,
        type: 'Sequence',
        options: [option({ correctOrder: '2' }), option({ correctOrder: '1' })],
      }).success,
    ).toBe(true);
  });

  it('rejects the Matching type the backend no longer accepts', () => {
    const result = questionSchema.safeParse({
      text: 'س',
      image: null,
      type: 'Matching',
      options: [option(), option()],
    });
    expect(result.success).toBe(false);
  });

  it('needs at least two options, each with text or an image', () => {
    const result = questionSchema.safeParse({
      text: 'س',
      image: null,
      type: 'MultiSelect',
      options: [option({ text: '', isCorrect: true })],
    });
    expect(messages(result)).toEqual(
      expect.arrayContaining(['أضف خيارين على الأقل', 'أدخل نصاً أو صورة للخيار']),
    );
  });
});

describe('activitySchema', () => {
  it('validates the slug format and rejects unsupported image types', () => {
    const result = activitySchema.safeParse({
      title: 'اختبار',
      description: '',
      slug: 'Bad Slug',
      categoryId: 'c1',
      icon: new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }),
    });
    expect(messages(result)).toEqual(
      expect.arrayContaining([
        'استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط',
        'يجب أن تكون الصورة بصيغة PNG أو JPG أو WEBP أو GIF',
      ]),
    );
  });
});
