import { CREATE_REPORT_MESSAGES, createReportSchema, toLines } from './createReport';

const VALID = {
  childId: 'mock-child-1',
  type: 'follow-up',
  strengths: 'يركّز جيداً\n\n  يتعاون  ',
  areasToSupport: 'الحروف المتشابهة',
  recommendations: 'قراءة يومية\nلعبة الحروف',
};

describe('createReportSchema', () => {
  it('splits each textarea into trimmed non-empty lines', () => {
    const result = createReportSchema.parse(VALID);

    expect(result.strengths).toEqual(['يركّز جيداً', 'يتعاون']);
    expect(result.recommendations).toHaveLength(2);
  });

  it('requires a child, a type and every section', () => {
    const result = createReportSchema.safeParse({
      childId: '',
      type: '',
      strengths: '   ',
      areasToSupport: '',
      recommendations: '\n',
    });

    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        CREATE_REPORT_MESSAGES.childRequired,
        CREATE_REPORT_MESSAGES.typeRequired,
        CREATE_REPORT_MESSAGES.strengthsRequired,
        CREATE_REPORT_MESSAGES.areasRequired,
        CREATE_REPORT_MESSAGES.recommendationsRequired,
      ]),
    );
  });

  it('rejects an unknown report type', () => {
    expect(createReportSchema.safeParse({ ...VALID, type: 'risk' }).success).toBe(false);
  });

  it('toLines drops blank lines', () => {
    expect(toLines('أ\n \nب')).toEqual(['أ', 'ب']);
  });
});
