import { z } from 'zod';

import { QUESTION_TYPES, type QuestionType } from '../types';

/** Frontend upload safeguard (backend limits are undocumented). SVG excluded (script risk). */
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const IMAGE_TYPES = IMAGE_ACCEPT.split(',');

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => IMAGE_TYPES.includes(file.type), {
    error: 'يجب أن تكون الصورة بصيغة PNG أو JPG أو WEBP أو GIF',
  })
  .refine((file) => file.size <= IMAGE_MAX_BYTES, {
    error: 'حجم الصورة يجب ألا يتجاوز 2 ميغابايت',
  })
  .nullable();

const MAX_NAME = 100;
const MAX_TITLE = 150;
const MAX_TEXT = 500;

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'اسم التصنيف مطلوب').max(MAX_NAME, 'اسم التصنيف طويل جداً'),
});
export type CategoryFormValues = z.infer<typeof categorySchema>;

export const activitySchema = z.object({
  title: z.string().trim().min(2, 'عنوان النشاط مطلوب (حرفان على الأقل)').max(MAX_TITLE),
  description: z.string().trim().max(MAX_TEXT, 'الوصف طويل جداً'),
  slug: z
    .string()
    .trim()
    .min(1, 'المعرّف المختصر مطلوب')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'استخدم أحرفاً إنجليزية صغيرة وأرقاماً وشرطات فقط'),
  categoryId: z.string().min(1, 'اختر التصنيف'),
  icon: imageFileSchema,
});
export type ActivityFormValues = z.infer<typeof activitySchema>;

const optionSchema = z.object({
  text: z.string().trim().max(MAX_TEXT),
  image: imageFileSchema,
  isCorrect: z.boolean(),
  correctOrder: z.string(),
  pairKey: z.string().trim(),
});

export const MIN_OPTIONS = 2;

/** Per-type answer rules. Matching/Sequence semantics are inferred from the field names. */
export const questionSchema = z
  .object({
    text: z.string().trim().min(1, 'نص السؤال مطلوب').max(MAX_TEXT),
    image: imageFileSchema,
    type: z.enum(QUESTION_TYPES, { error: 'اختر نوع السؤال' }),
    options: z.array(optionSchema).min(MIN_OPTIONS, 'أضف خيارين على الأقل'),
  })
  .superRefine((values, ctx) => {
    values.options.forEach((option, index) => {
      if (!option.text && !option.image) {
        ctx.addIssue({
          code: 'custom',
          path: ['options', index, 'text'],
          message: 'أدخل نصاً أو صورة للخيار',
        });
      }
    });
    const correct = values.options.filter((option) => option.isCorrect).length;
    if (values.type === 'SingleChoice' && correct !== 1) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'حدّد إجابة صحيحة واحدة فقط' });
    }
    if (values.type === 'MultiSelect' && correct < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'حدّد إجابة صحيحة واحدة على الأقل',
      });
    }
    if (values.type === 'Sequence') {
      const orders = values.options.map((option) => Number(option.correctOrder));
      const expected = values.options.map((_, index) => index + 1);
      const valid = [...orders]
        .sort((a, b) => a - b)
        .every((value, index) => value === expected[index]);
      if (!valid) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: `رتّب الخيارات بأرقام من 1 إلى ${values.options.length.toString()} دون تكرار`,
        });
      }
    }
    if (values.type === 'Matching') {
      const counts = new Map<string, number>();
      for (const option of values.options) {
        counts.set(option.pairKey, (counts.get(option.pairKey) ?? 0) + 1);
      }
      const invalid = values.options.some(
        (option) => !option.pairKey || (counts.get(option.pairKey) ?? 0) < 2,
      );
      if (invalid) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: 'لكل خيار مفتاح مطابقة يتكرر في خيار آخر واحد على الأقل',
        });
      }
    }
  });
export type QuestionFormValues = z.infer<typeof questionSchema>;

export const questionInfoSchema = z.object({
  text: z.string().trim().min(1, 'نص السؤال مطلوب').max(MAX_TEXT),
  image: imageFileSchema,
  type: z.enum(QUESTION_TYPES, { error: 'اختر نوع السؤال' }),
});
export type QuestionInfoFormValues = z.infer<typeof questionInfoSchema>;

export const optionEditSchema = z.object({
  text: z.string().trim().max(MAX_TEXT),
  image: imageFileSchema,
  order: z.string().regex(/^\d+$/, 'أدخل رقماً صحيحاً'),
  isCorrect: z.boolean(),
  correctOrder: z.string(),
  pairKey: z.string().trim(),
});
export type OptionEditFormValues = z.infer<typeof optionEditSchema>;

export function usesCorrectFlag(type: QuestionType | null): boolean {
  return type === 'SingleChoice' || type === 'MultiSelect' || type === null;
}
