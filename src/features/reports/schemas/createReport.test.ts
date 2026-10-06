import { toLines } from '../lines';

import { createReportSchema, REPORT_FORM_MESSAGES, reportFieldsSchema } from './createReport';

describe('createReportSchema', () => {
  it('accepts the API fields and trims them', () => {
    const result = createReportSchema.parse({
      childId: 'c-1',
      title: '  تقرير متابعة ',
      weaknesses: 'تمييز الحروف',
      recommendations: 'قراءة يومية',
    });
    expect(result).toEqual({
      childId: 'c-1',
      title: 'تقرير متابعة',
      weaknesses: 'تمييز الحروف',
      recommendations: 'قراءة يومية',
    });
  });

  it('requires the child, title, weaknesses and recommendations', () => {
    const result = createReportSchema.safeParse({
      childId: '',
      title: ' ',
      weaknesses: '',
      recommendations: '',
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message) ?? [];
    expect(messages).toEqual(
      expect.arrayContaining([
        REPORT_FORM_MESSAGES.childRequired,
        REPORT_FORM_MESSAGES.titleRequired,
        REPORT_FORM_MESSAGES.weaknessesRequired,
        REPORT_FORM_MESSAGES.recommendationsRequired,
      ]),
    );
  });

  it('has no strengths or report type (not API fields)', () => {
    expect(Object.keys(reportFieldsSchema.shape)).toEqual([
      'title',
      'weaknesses',
      'recommendations',
    ]);
  });
});

describe('toLines', () => {
  it('splits API text into non-empty trimmed lines', () => {
    expect(toLines(' أولاً \r\n\nثانياً\n')).toEqual(['أولاً', 'ثانياً']);
  });
});
