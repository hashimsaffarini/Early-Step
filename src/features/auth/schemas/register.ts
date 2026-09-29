import { z } from 'zod';

import { confirmPasswordField, emailField, newPasswordField } from './fields';
import { AUTH_MESSAGES } from './messages';

const MIN_NAME_LENGTH = 2;

/** Public self-registration is for parents only (product requirement). */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, AUTH_MESSAGES.nameRequired)
      .min(MIN_NAME_LENGTH, AUTH_MESSAGES.nameTooShort),
    email: emailField,
    password: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: AUTH_MESSAGES.passwordsMismatch,
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
