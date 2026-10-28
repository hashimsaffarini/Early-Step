import { QueryClient } from '@tanstack/react-query';

import type { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

const DEFAULT_STALE_TIME_MS = 30_000;
const MAX_QUERY_RETRIES = 2;

/** Errors that will not succeed on retry (client errors, auth, cancellation). */
function isRetryable(error: AppError): boolean {
  if (error.kind === 'canceled' || error.kind === 'configuration') return false;
  if (error.status === undefined) return true;
  return error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => failureCount < MAX_QUERY_RETRIES && isRetryable(error),
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/*
 * Every request goes through `httpClient`, whose response interceptor rejects
 * with `AppError`, so query/mutation errors are typed as `AppError` app-wide.
 * Query functions must not throw anything else (wrap with `normalizeError`).
 */
declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AppError;
  }
}
