import type { ReactElement } from 'react';

import type { AreaRole } from '@/constants/routes';
import { getAreaPaths } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderWithRouter } from '@/test/renderWithRouter';

/** Renders a reports page inside a role area at a concrete path. */
export function renderReportsPage(
  role: AreaRole,
  element: ReactElement,
  options: { routePath?: string; path?: string } = {},
) {
  const paths = getAreaPaths(role);
  return renderWithRouter(
    [
      {
        path: options.routePath ?? paths.reports,
        element: <RoleAreaContext value={role}>{element}</RoleAreaContext>,
      },
      { path: '*', element: <p>صفحة أخرى</p> },
    ],
    options.path ?? paths.reports,
  );
}
