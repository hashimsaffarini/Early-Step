import { z } from 'zod';

import { REPORT_TYPES } from '../constants';

export const CREATE_REPORT_MESSAGES = {
  childRequired: 'الرجاء اختيار الطفل',
  typeRequired: 'الرجاء اختيار نوع التقرير',
  strengthsRequired: 'الرجاء كتابة نقاط القوة',
  areasRequired: 'الرجاء كتابة الجوانب التي تحتاج إلى دعم',
  recommendationsRequired: 'الرجاء كتابة التوصيات',
} as const;

/** Splits a textarea into trimmed, non-empty lines (one observation per line). */
export function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const linesField = (message: string) =>
  z.string().transform(toLines).pipe(z.array(z.string()).min(1, message));

/**
 * Replit "إدخال يدوي" report form. The AI mode and the probability slider are intentionally
 * not migrated (no AI branding, no risk probability).
 */
export const createReportSchema = z.object({
  childId: z.string().min(1, CREATE_REPORT_MESSAGES.childRequired),
  type: z
    .string()
    .min(1, CREATE_REPORT_MESSAGES.typeRequired)
    .pipe(z.enum(REPORT_TYPES, { error: CREATE_REPORT_MESSAGES.typeRequired })),
  strengths: linesField(CREATE_REPORT_MESSAGES.strengthsRequired),
  areasToSupport: linesField(CREATE_REPORT_MESSAGES.areasRequired),
  recommendations: linesField(CREATE_REPORT_MESSAGES.recommendationsRequired),
});

export type CreateReportFormInput = z.input<typeof createReportSchema>;
export type CreateReportFormValues = z.output<typeof createReportSchema>;
