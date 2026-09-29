import { Navigate, type RouteObject } from 'react-router';

import { devPreviewRoutes } from '@/app/dev/ui-preview/devRoutes';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { UnauthorizedPage } from '@/app/pages/UnauthorizedPage';
import { ParentAreaLayout } from '@/app/layouts/ParentAreaLayout';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RootLayout } from '@/components/layout/RootLayout';
import { ROUTE_PATHS } from '@/constants/routes';
import { LandingPage } from '@/features/landing';

/** Auth screens (and their form/validation libraries) load on demand. */
const loadAuth = () => import('@/features/auth');

/**
 * Route tree. Public routes only for now (landing + auth UI, no backend) —
 * see docs/ROUTING.md. The landing page is eager for first paint.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTE_PATHS.home, element: <LandingPage /> },
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTE_PATHS.login,
            lazy: async () => ({ Component: (await loadAuth()).LoginPage }),
          },
          {
            path: ROUTE_PATHS.register,
            lazy: async () => ({ Component: (await loadAuth()).RegisterPage }),
          },
        ],
      },
      {
        path: ROUTE_PATHS.forgotPassword,
        lazy: async () => ({ Component: (await loadAuth()).ForgotPasswordPage }),
      },
      {
        path: ROUTE_PATHS.resetPassword,
        lazy: async () => ({ Component: (await loadAuth()).ResetPasswordPage }),
      },
      {
        // TEMPORARY: no auth guard yet — parent area is open for UI development (see ROUTING.md).
        path: ROUTE_PATHS.parentRoot,
        element: <ParentAreaLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTE_PATHS.parentDashboard} replace /> },
          {
            path: ROUTE_PATHS.parentDashboard,
            lazy: async () => ({
              Component: (await import('@/app/pages/ParentDashboardRoute')).ParentDashboardRoute,
            }),
          },
        ],
      },
      { path: ROUTE_PATHS.unauthorized, element: <UnauthorizedPage /> },
      ...(import.meta.env.DEV ? devPreviewRoutes : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
