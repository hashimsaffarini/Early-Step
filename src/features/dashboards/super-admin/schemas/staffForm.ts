import { z } from 'zod';

import { evaluatePassword } from '@/utils/passwordPolicy';

import { STAFF_ROLES } from '@/features/dashboards/api/superAdminApi';

export const staffFormSchema = z.object({
  fullName: z.string().trim().min(1, 'الاسم مطلوب'),
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .pipe(z.email('البريد الإلكتروني غير صالح')),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .refine((value) => evaluatePassword(value).meetsAll, {
      error: 'كلمة المرور لا تستوفي الشروط: 8 أحرف على الأقل، حرف كبير وصغير، رقم ورمز خاص.',
    }),
  role: z.enum(STAFF_ROLES, { error: 'اختر الدور' }),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;
export type StaffFormInput = z.input<typeof staffFormSchema>;

/** Edit an employee (`PUT SuperAdmin/users/{id}`): name, email, role (staff only) and status. */
export const staffEditSchema = z.object({
  fullName: z.string().trim().min(1, 'الاسم مطلوب'),
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .pipe(z.email('البريد الإلكتروني غير صالح')),
  role: z.string().min(1, 'اختر الدور'),
  isActive: z.boolean(),
});

export type StaffEditValues = z.infer<typeof staffEditSchema>;
