import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { registerHttpAuthHooks } from '@/services/http/interceptors';
import { getAccessToken, hasSessionOrToken, useSessionStore } from '@/services/session';

/**
 * Connects the HTTP layer to the session: bearer token on every request; on 401 (expired or
 * invalid token, including the `Auth/me` check after a reload) the session is dropped and all
 * cached server data cleared (guards then send the user to login).
 */
export function AuthHttpBridge() {
  const queryClient = useQueryClient();
  useEffect(() => {
    registerHttpAuthHooks({
      getAccessToken,
      onUnauthorized: () => {
        if (!hasSessionOrToken()) return;
        useSessionStore.getState().signOut();
        queryClient.clear();
      },
    });
  }, [queryClient]);
  return null;
}
