import { z } from 'zod';

import { PLAN_STATUSES } from '../types';

const MIN_TITLE_LENGTH = 3;

export const PLAN_FORM_MESSAGES = {
  titleRequired: 'عنوان الخطة مطلوب',
  titleTooShort: 'يجب أن يحتوي العنوان على 3 أحرف على الأقل',
  goalsRequired: 'أضف هدفاً واحداً على الأقل',
  strategiesRequired: 'أضف استراتيجية واحدة على الأقل',
  statusRequired: 'يرجى اختيار حالة الخطة',
} as const;

/** Splits a textarea into one item per non-empty line. */
export function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Replit IEP form fields (goals, strategies, status, review date) + a plan title. */
export const educationPlanSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, PLAN_FORM_MESSAGES.titleRequired)
    .min(MIN_TITLE_LENGTH, PLAN_FORM_MESSAGES.titleTooShort),
  goals: z
    .string()
    .refine((value) => toLines(value).length > 0, { error: PLAN_FORM_MESSAGES.goalsRequired }),
  strategies: z.string().refine((value) => toLines(value).length > 0, {
    error: PLAN_FORM_MESSAGES.strategiesRequired,
  }),
  status: z
    .string()
    .min(1, PLAN_FORM_MESSAGES.statusRequired)
    .pipe(z.enum(PLAN_STATUSES, { error: PLAN_FORM_MESSAGES.statusRequired })),
  reviewDate: z.string(),
  notes: z.string().trim(),
});

export type EducationPlanFormInput = z.input<typeof educationPlanSchema>;
export type EducationPlanFormValues = z.output<typeof educationPlanSchema>;
