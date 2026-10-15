import { z } from 'zod';

export const REPORT_FORM_MESSAGES = {
  childRequired: 'الرجاء اختيار الطفل',
  titleRequired: 'الرجاء كتابة عنوان التقرير',
  titleTooShort: 'عنوان التقرير قصير جداً',
  weaknessesRequired: 'الرجاء كتابة الجوانب التي تحتاج إلى دعم',
  recommendationsRequired: 'الرجاء كتابة التوصيات',
} as const;

const MIN_TITLE_LENGTH = 2;
const MAX_TITLE_LENGTH = 200;
const MAX_TEXT_LENGTH = 4000;

/** Fields of the real API (`title`, `weaknesses`, `recommendations`) — no strengths, no type. */
export const reportFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, REPORT_FORM_MESSAGES.titleRequired)
    .min(MIN_TITLE_LENGTH, REPORT_FORM_MESSAGES.titleTooShort)
    .max(MAX_TITLE_LENGTH),
  weaknesses: z
    .string()
    .trim()
    .min(1, REPORT_FORM_MESSAGES.weaknessesRequired)
    .max(MAX_TEXT_LENGTH),
  recommendations: z
    .string()
    .trim()
    .min(1, REPORT_FORM_MESSAGES.recommendationsRequired)
    .max(MAX_TEXT_LENGTH),
});

export const createReportSchema = reportFieldsSchema.extend({
  childId: z.string().min(1, REPORT_FORM_MESSAGES.childRequired),
});

export type ReportFieldsValues = z.infer<typeof reportFieldsSchema>;
export type CreateReportFormValues = z.infer<typeof createReportSchema>;
