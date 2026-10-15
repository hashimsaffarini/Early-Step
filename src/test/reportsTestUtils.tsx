import type { ReactElement } from 'react';

import type { AreaRole } from '@/constants/routes';
import { getAreaPaths, ROLE_NAMESPACES } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

export const YOUSEF = 'c0000000-0000-4000-8000-000000000001';
export const NOUR = 'c0000000-0000-4000-8000-000000000002';
export const REPORT_YOUSEF = 'r0000000-0000-4000-8000-000000000001';
export const REPORT_NOUR = 'r0000000-0000-4000-8000-000000000002';

/**
 * Signs in as `role` and renders a reports page inside its role area. Other report routes
 * render a marker heading so navigation can be asserted.
 */
export function renderReportsPage(
  role: AreaRole,
  element: ReactElement,
  options: { routePath?: string; path?: string } = {},
) {
  signInAs(role);
  const paths = getAreaPaths(role);
  const ns = ROLE_NAMESPACES[role];
  return renderWithRouter(
    [
      {
        path: options.routePath ?? paths.reports,
        element: <RoleAreaContext value={role}>{element}</RoleAreaContext>,
      },
      { path: paths.reports, element: <h1>قائمة التقارير</h1> },
      { path: `${ns}/reports/:reportId`, element: <h1>تفاصيل التقرير</h1> },
      { path: '*', element: <p>صفحة أخرى</p> },
    ],
    options.path ?? paths.reports,
  );
}
