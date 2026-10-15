import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import type { AppError } from '@/services/http/apiError';

export interface QueryStatusProps {
  isLoading: boolean;
  error: AppError | null;
  isEmpty: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry: () => void;
}

/** Loading / error (with retry) / empty states for a content list. Returns null when there is data. */
export function QueryStatus({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
}: QueryStatusProps) {
  if (isLoading) return <LoadingState />;
  if (error) {
    return (
      <ErrorState
        title="تعذّر تحميل البيانات"
        description={error.message}
        action={
          <Button variant="outline" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }
  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        {...(emptyDescription ? { description: emptyDescription } : {})}
      />
    );
  }
  return null;
}
