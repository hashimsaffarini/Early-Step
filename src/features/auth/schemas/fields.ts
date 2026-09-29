import { z } from 'zod';

import { AUTH_MESSAGES } from './messages';
import { evaluatePassword } from './password';

export const emailField = z
  .string()
  .trim()
  .min(1, AUTH_MESSAGES.emailRequired)
  .pipe(z.email(AUTH_MESSAGES.emailInvalid));

/** New passwords must meet every criterion of the strength meter. */
export const newPasswordField = z
  .string()
  .min(1, AUTH_MESSAGES.passwordRequired)
  .refine((value) => evaluatePassword(value).meetsAll, { error: AUTH_MESSAGES.passwordWeak });

export const confirmPasswordField = z.string().min(1, AUTH_MESSAGES.confirmRequired);
