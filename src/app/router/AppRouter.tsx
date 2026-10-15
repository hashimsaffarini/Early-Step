import { useState } from 'react';
import { createBrowserRouter, createHashRouter, RouterProvider } from 'react-router';

import { routes } from '@/app/router/routes';

/**
 * Production builds are hosted on GitHub Pages (`/Early-Step/`), which has no SPA rewrites: a
 * refreshed `/Early-Step/parent/dashboard` would be a 404. Production therefore uses hash URLs
 * (`/Early-Step/#/parent/dashboard`) — every route is served by `index.html`, so direct links and
 * refreshes always work. Development keeps clean browser URLs. (Docs: `DEPLOYMENT.md`, ADR-024.)
 */
const createRouter = import.meta.env.PROD ? createHashRouter : createBrowserRouter;

export function AppRouter() {
  const [router] = useState(() => createRouter(routes));
  return <RouterProvider router={router} />;
}
