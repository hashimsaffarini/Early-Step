import { z } from 'zod';

import { confirmPasswordField, emailField, newPasswordField } from './fields';
import { AUTH_MESSAGES } from './messages';

export const forgotPasswordSchema = z.object({ email: emailField });

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/** Code: digits only; length not documented (Apidog example: 4 digits) — NOT LIVE-VERIFIED. */
export const resetPasswordSchema = z
  .object({
    email: emailField,
    code: z
      .string()
      .trim()
      .min(1, AUTH_MESSAGES.codeRequired)
      .regex(/^\d+$/, AUTH_MESSAGES.codeDigitsOnly),
    password: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((values) => values.password === values.confirmPassword, {
    error: AUTH_MESSAGES.passwordsMismatch,
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
