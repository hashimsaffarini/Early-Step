import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';

/** Renders route objects in a memory router (for layout/navigation tests). */
export function renderWithRouter(routes: RouteObject[], initialPath = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  return { router, ...render(<RouterProvider router={router} />) };
}

/** Wraps a single element in a router at `/`. */
export function renderInRouter(element: ReactElement, initialPath = '/') {
  return renderWithRouter([{ path: '*', element }], initialPath);
}
