import { z } from 'zod';

const MIN_NAME_LENGTH = 2;
export const MIN_CHILD_AGE = 1;
export const MAX_CHILD_AGE = 18;

export const CHILD_FORM_MESSAGES = {
  nameRequired: 'اسم الطفل مطلوب',
  nameTooShort: 'يجب أن يحتوي الاسم على حرفين على الأقل',
  ageRequired: 'العمر مطلوب',
  ageInvalid: `يجب أن يكون العمر عدداً صحيحاً بين ${MIN_CHILD_AGE.toString()} و${MAX_CHILD_AGE.toString()}`,
  genderRequired: 'يرجى اختيار الجنس',
} as const;

/**
 * Add/edit child. The API stores an integer **age** (Swagger `Age:int32`), not a birth date,
 * so the form asks for the age in years. (Replit's birth date and optional developmental age
 * are not used.) Gender values are the backend's Arabic enum.
 */
export const childFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, CHILD_FORM_MESSAGES.nameRequired)
    .min(MIN_NAME_LENGTH, CHILD_FORM_MESSAGES.nameTooShort),
  age: z
    .string()
    .trim()
    .min(1, CHILD_FORM_MESSAGES.ageRequired)
    .regex(/^\d+$/, CHILD_FORM_MESSAGES.ageInvalid)
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(MIN_CHILD_AGE, CHILD_FORM_MESSAGES.ageInvalid)
        .max(MAX_CHILD_AGE, CHILD_FORM_MESSAGES.ageInvalid),
    ),
  gender: z
    .string()
    .min(1, CHILD_FORM_MESSAGES.genderRequired)
    .pipe(z.enum(['ولد', 'بنت'], { error: CHILD_FORM_MESSAGES.genderRequired })),
});

export type ChildFormInput = z.input<typeof childFormSchema>;
export type ChildFormValues = z.output<typeof childFormSchema>;
