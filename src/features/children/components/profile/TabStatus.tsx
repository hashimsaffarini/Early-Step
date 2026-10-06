import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import type { AppError } from '@/services/http/apiError';

interface QueryLike {
  isPending: boolean;
  isError: boolean;
  error: AppError | null;
  refetch: () => unknown;
}

/** Loading / error rendering shared by the profile sections. Returns null when data is ready. */
export function QueryStatus({ query, errorTitle }: { query: QueryLike; errorTitle: string }) {
  if (query.isPending) return <LoadingState />;
  if (query.isError) {
    return (
      <ErrorState
        isBoxed={false}
        title={errorTitle}
        {...(query.error ? { description: query.error.message } : {})}
        action={
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }
  return null;
}
