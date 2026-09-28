import type { RouteObject } from 'react-router';

import { DEV_PREVIEW_PATHS } from '@/app/router/paths';

/**
 * Development-only UI preview routes. Lazy-loaded so none of this code ships
 * in production builds (the whole array is dropped when DEV is false).
 */
export const devPreviewRoutes: RouteObject[] = [
  {
    path: DEV_PREVIEW_PATHS.root,
    lazy: async () => ({ Component: (await import('./PreviewShell')).PreviewShell }),
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./OverviewPreviewPage')).OverviewPreviewPage,
        }),
      },
      {
        path: DEV_PREVIEW_PATHS.components,
        lazy: async () => ({
          Component: (await import('./ComponentsPreviewPage')).ComponentsPreviewPage,
        }),
      },
      {
        path: DEV_PREVIEW_PATHS.forms,
        lazy: async () => ({ Component: (await import('./FormsPreviewPage')).FormsPreviewPage }),
      },
    ],
  },
  {
    path: DEV_PREVIEW_PATHS.auth,
    lazy: async () => ({ Component: (await import('@/components/layout/AuthLayout')).AuthLayout }),
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./AuthPreviewPage')).AuthPreviewPage }),
      },
    ],
  },
  {
    path: DEV_PREVIEW_PATHS.child,
    lazy: async () => ({ Component: (await import('./ChildPreviewLayout')).ChildPreviewLayout }),
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('./ChildPreviewPage')).ChildPreviewPage }),
      },
    ],
  },
];
