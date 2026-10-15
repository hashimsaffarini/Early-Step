import type { RouteObject } from 'react-router';

import { devPreviewRoutes } from '@/app/dev/ui-preview/devRoutes';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { UnauthorizedPage } from '@/app/pages/UnauthorizedPage';
import { areaRoutes } from '@/app/router/areaRoutes';
import { PublicOnly } from '@/app/router/guards';
import { RouteErrorPage } from '@/app/router/RouteErrorPage';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { RootLayout } from '@/components/layout/RootLayout';
import { ROUTE_PATHS } from '@/constants/routes';
import { LandingPage } from '@/features/landing';

/** Auth screens (and their form/validation libraries) load on demand. */
const loadAuth = () => import('@/features/auth');

/**
 * Route tree: public landing + auth, then every role area behind `RequireRole` — see
 * docs/ROUTING.md. The landing page is eager for first paint.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: ROUTE_PATHS.home, element: <LandingPage /> },
      {
        element: (
          <PublicOnly>
            <AuthLayout />
          </PublicOnly>
        ),
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
      ...areaRoutes,
      { path: ROUTE_PATHS.unauthorized, element: <UnauthorizedPage /> },
      ...(import.meta.env.DEV ? devPreviewRoutes : []),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
