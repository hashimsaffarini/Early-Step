import { z } from 'zod';

import { toIsoDateString } from '@/utils/dateFormat';

const MIN_NAME_LENGTH = 2;

export const ADD_CHILD_MESSAGES = {
  nameRequired: 'اسم الطفل مطلوب',
  nameTooShort: 'يجب أن يحتوي الاسم على حرفين على الأقل',
  birthDateRequired: 'تاريخ الميلاد مطلوب',
  birthDateFuture: 'تاريخ الميلاد لا يمكن أن يكون في المستقبل',
  genderRequired: 'يرجى اختيار الجنس',
} as const;

/**
 * Replit "إضافة ملف طفل جديد" fields: name, birth date, gender.
 * (Replit's optional "estimated developmental age" is intentionally omitted — see docs.)
 */
export const addChildSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, ADD_CHILD_MESSAGES.nameRequired)
    .min(MIN_NAME_LENGTH, ADD_CHILD_MESSAGES.nameTooShort),
  birthDate: z
    .string()
    .min(1, ADD_CHILD_MESSAGES.birthDateRequired)
    .refine((value) => value <= toIsoDateString(new Date()), {
      error: ADD_CHILD_MESSAGES.birthDateFuture,
    }),
  gender: z
    .string()
    .min(1, ADD_CHILD_MESSAGES.genderRequired)
    .pipe(z.enum(['boy', 'girl'], { error: ADD_CHILD_MESSAGES.genderRequired })),
});

export type AddChildFormInput = z.input<typeof addChildSchema>;
export type AddChildFormValues = z.output<typeof addChildSchema>;
