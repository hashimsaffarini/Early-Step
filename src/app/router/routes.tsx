import type { RouteObject } from 'react-router';

import { devPreviewRoutes } from '@/app/dev/ui-preview/devRoutes';
import { HomePage } from '@/app/pages/HomePage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { UnauthorizedPage } from '@/app/pages/UnauthorizedPage';
import { ROUTE_PATHS } from '@/app/router/paths';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { RootLayout } from '@/components/layout/RootLayout';

/**
 * Route tree. Feature routes (auth, role namespaces) will be added here as
 * route modules exported from each feature — see docs/ROUTING.md.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTE_PATHS.home, element: <HomePage /> },
      { path: ROUTE_PATHS.unauthorized, element: <UnauthorizedPage /> },
      ...(import.meta.env.DEV ? devPreviewRoutes : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
