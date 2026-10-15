import { toFormData } from '@/services/http/formData';
import { httpClient } from '@/services/http/httpClient';
import type { Session } from '@/services/session';

import { fetchCurrentUser } from './currentUser';
import { parseLoginResponse } from './loginResponse';

/** Paths relative to `VITE_API_BASE_URL` (Swagger: `/api/Auth/*`). */
export const AUTH_PATHS = {
  login: 'Auth/login',
  register: 'Auth/register',
  forgotPassword: 'Auth/ForgotPassword',
  resetPassword: 'Auth/reset-password',
  changePassword: 'Auth/change-password',
} as const;

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * `POST Auth/login` (`multipart/form-data`) for the token, then `GET Auth/me` for the user — the
 * same call that restores the session after a reload, so both paths share one source of truth.
 */
export async function login(input: LoginInput): Promise<Session> {
  const { data } = await httpClient.post<unknown>(
    AUTH_PATHS.login,
    toFormData({ Email: input.email, Password: input.password, RememberMe: input.rememberMe }),
  );
  const token = parseLoginResponse(data);
  const user = await fetchCurrentUser(token.accessToken);
  return { ...token, user };
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Public registration creates Parent accounts only: since 2026-10-10 the Swagger contract has no
 * `Role` field, so none is sent (the server decides the role).
 */
export async function registerParent(input: RegisterInput): Promise<void> {
  await httpClient.post(
    AUTH_PATHS.register,
    toFormData({
      FullName: input.fullName,
      Email: input.email,
      Password: input.password,
      ConfirmPassword: input.confirmPassword,
    }),
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  await httpClient.post(AUTH_PATHS.forgotPassword, { email });
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await httpClient.post(AUTH_PATHS.resetPassword, input);
}
