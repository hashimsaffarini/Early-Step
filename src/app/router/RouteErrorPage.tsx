import { isRouteErrorResponse, useRouteError } from 'react-router';

import { ErrorState } from '@/components/shared/ErrorState';

/** Rendered by React Router when a route throws during render or loading. */
export function RouteErrorPage() {
  const error = useRouteError();

  if (import.meta.env.DEV) {
    console.error(error);
  }

  const description = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';

  return (
    <main className="page-center">
      <ErrorState title="حدث خطأ" description={description} />
    </main>
  );
}
