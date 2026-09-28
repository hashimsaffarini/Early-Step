import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from '@/app/router/routes';

export function AppRouter() {
  const [router] = useState(() => createBrowserRouter(routes));
  return <RouterProvider router={router} />;
}
