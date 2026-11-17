import { z } from 'zod';

import { confirmPasswordField, newPasswordField } from './fields';
import { AUTH_MESSAGES } from './messages';

/** Swagger `ChangePasswordRequest`: `{ currentPassword, newPassword, confirmPassword }`. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, AUTH_MESSAGES.currentPasswordRequired),
    newPassword: newPasswordField,
    confirmPassword: confirmPasswordField,
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    error: AUTH_MESSAGES.passwordsMismatch,
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    error: AUTH_MESSAGES.samePassword,
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
