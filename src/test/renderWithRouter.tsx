import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

import { ToastProvider } from '@/components/ui/Toast';

/** Fresh query client per test: no retries, no cache shared between tests. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
}

/** Renders route objects in a memory router with a query client (HTTP is mocked by MSW). */
export function renderWithRouter(routes: RouteObject[], initialPath = '/', initialState?: unknown) {
  const queryClient = createTestQueryClient();
  const router = createMemoryRouter(routes, {
    initialEntries: [
      initialState === undefined ? initialPath : { pathname: initialPath, state: initialState },
    ],
  });
  return {
    router,
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </QueryClientProvider>,
    ),
  };
}

/** Wraps a single element in a router at `/`. */
export function renderInRouter(element: ReactElement, initialPath = '/') {
  return renderWithRouter([{ path: '*', element }], initialPath);
}
