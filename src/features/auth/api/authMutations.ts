import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSessionStore } from '@/services/session';

import {
  login,
  registerParent,
  requestPasswordReset,
  resetPassword,
  type LoginInput,
} from './authApi';

/** Signs in and stores the session. Any cached data from a previous account is dropped first. */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const signIn = useSessionStore((state) => state.signIn);
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: (session, input) => {
      queryClient.clear();
      signIn(session, input.rememberMe);
    },
  });
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: registerParent });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: requestPasswordReset });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPassword });
}
