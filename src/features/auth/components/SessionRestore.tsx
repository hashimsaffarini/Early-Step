import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { queryKeys } from '@/services/api/queryKeys';
import { useSessionStore } from '@/services/session';

import { fetchCurrentUser } from '../api/currentUser';

/**
 * Shown by the route guards while a token restored from storage is confirmed with `GET Auth/me`.
 * Success → the session gets its user (current role from the server). 401 → the HTTP layer signs
 * out and clears the cache, and the guard sends the user to login. Other failures (network, 5xx)
 * keep the token and offer a retry or a fresh login.
 */
export function SessionRestore() {
  const restore = useSessionStore((state) => state.restore);
  const signOut = useSessionStore((state) => state.signOut);
  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => fetchCurrentUser(),
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data) restore(query.data);
  }, [query.data, restore]);

  if (query.isError) {
    return (
      <ErrorState
        title="تعذّر التحقق من الجلسة"
        description={query.error.message}
        isBoxed={false}
        action={
          <>
            <Button onClick={() => void query.refetch()} isLoading={query.isFetching}>
              إعادة المحاولة
            </Button>
            <Button variant="ghost" onClick={signOut}>
              تسجيل الدخول من جديد
            </Button>
          </>
        }
      />
    );
  }
  return <LoadingState label="جارٍ التحقق من الجلسة…" />;
}
