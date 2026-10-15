import { z } from 'zod';

const MAX_LENGTH = 2000;

export const noteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'نص الملاحظة مطلوب')
    .max(MAX_LENGTH, `يجب ألا تتجاوز الملاحظة ${MAX_LENGTH.toString()} حرف`),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
