import { PARENT_REGISTRATION_ROLE } from '@/constants/backendRoles';
import { toFormData } from '@/services/http/formData';
import { httpClient } from '@/services/http/httpClient';
import type { Session } from '@/services/session';

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

/** `multipart/form-data` (Swagger). Response shape NOT LIVE-VERIFIED — see `parseLoginResponse`. */
export async function login(input: LoginInput): Promise<Session> {
  const { data } = await httpClient.post<unknown>(
    AUTH_PATHS.login,
    toFormData({ Email: input.email, Password: input.password, RememberMe: input.rememberMe }),
  );
  return parseLoginResponse(data);
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** Public registration is parent-only; the role value is the one observed on the wire. */
export async function registerParent(input: RegisterInput): Promise<void> {
  await httpClient.post(
    AUTH_PATHS.register,
    toFormData({
      FullName: input.fullName,
      Email: input.email,
      Password: input.password,
      ConfirmPassword: input.confirmPassword,
      Role: PARENT_REGISTRATION_ROLE,
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
