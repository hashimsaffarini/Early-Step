import { Navigate, type RouteObject } from 'react-router';

import { RoleAreaLayout } from '@/app/layouts/RoleAreaLayout';
import { RoleAreaRoot } from '@/app/layouts/RoleAreaRoot';
import { RequireRole } from '@/app/router/guards';
import {
  AREA_SEGMENTS,
  canCreateReports,
  getAreaPaths,
  ROLE_NAMESPACES,
  ROUTE_PATHS,
  type AreaRole,
} from '@/constants/routes';

const loadDashboards = () => import('@/app/pages/DashboardRoutes');
const loadChildren = () => import('@/features/children');
const loadActivities = () => import('@/features/activities');
const loadReports = () => import('@/features/reports');

/** Each role has its own dashboard screen (with its mock session user). */
async function loadDashboardRoute(role: AreaRole) {
  const dashboards = await loadDashboards();
  const byRole = {
    Parent: dashboards.ParentDashboardRoute,
    Teacher: dashboards.TeacherDashboardRoute,
    Specialist: dashboards.SpecialistDashboardRoute,
    Admin: dashboards.AdminDashboardRoute,
  } satisfies Record<AreaRole, unknown>;
  return { Component: byRole[role] };
}

/**
 * One role area: shell pages inside the DashboardLayout plus full-screen child activity
 * pages (players and the initial assessment) without the sidebar.
 * Guarded by `RequireRole` (UX only — the backend enforces authorization).
 */
function buildAreaRoute(role: AreaRole): RouteObject {
  const shellPages: RouteObject[] = [
    { index: true, element: <Navigate to={getAreaPaths(role).dashboard} replace /> },
    { path: AREA_SEGMENTS.dashboard, lazy: () => loadDashboardRoute(role) },
    {
      path: AREA_SEGMENTS.children,
      lazy: async () => ({ Component: (await loadChildren()).ChildrenListPage }),
    },
    {
      path: AREA_SEGMENTS.childProfile,
      lazy: async () => ({ Component: (await loadChildren()).ChildProfilePage }),
    },
    {
      path: AREA_SEGMENTS.childPlans,
      lazy: async () => ({
        Component: (await import('@/features/training-plans')).ChildPlansPage,
      }),
    },
    {
      path: AREA_SEGMENTS.tests,
      lazy: async () => ({ Component: (await loadActivities()).TestsCatalogPage }),
    },
    {
      path: AREA_SEGMENTS.games,
      lazy: async () => ({ Component: (await loadActivities()).GamesCatalogPage }),
    },
    {
      path: AREA_SEGMENTS.reports,
      lazy: async () => ({ Component: (await loadReports()).ReportsListPage }),
    },
    ...(canCreateReports(role)
      ? [
          {
            path: AREA_SEGMENTS.reportCreate,
            lazy: async () => ({ Component: (await loadReports()).CreateReportPage }),
          },
        ]
      : []),
    {
      path: AREA_SEGMENTS.reportDetail,
      lazy: async () => ({ Component: (await loadReports()).ReportDetailPage }),
    },
    {
      path: AREA_SEGMENTS.messages,
      lazy: async () => ({ Component: (await import('@/features/chat')).MessagesPage }),
    },
  ];

  const fullScreenPages: RouteObject[] = [
    {
      path: AREA_SEGMENTS.testPlay,
      lazy: async () => ({ Component: (await loadActivities()).TestPlayerPage }),
    },
    {
      path: AREA_SEGMENTS.gamePlay,
      lazy: async () => ({ Component: (await loadActivities()).GamePlayerPage }),
    },
    {
      path: AREA_SEGMENTS.assessment,
      lazy: async () => ({ Component: (await import('@/features/assessments')).AssessmentPage }),
    },
  ];

  return {
    path: ROLE_NAMESPACES[role],
    element: (
      <RequireRole role={role}>
        <RoleAreaRoot role={role} />
      </RequireRole>
    ),
    children: [
      { element: <RoleAreaLayout role={role} />, children: shellPages },
      ...fullScreenPages,
    ],
  };
}

/** Super Admin: a single panel (Replit `/admin`), in the shared shell. */
const superAdminRoute: RouteObject = {
  path: ROUTE_PATHS.superAdmin,
  element: (
    <RequireRole role="SuperAdmin">
      <RoleAreaLayout role="SuperAdmin" />
    </RequireRole>
  ),
  children: [
    {
      index: true,
      lazy: async () => ({ Component: (await loadDashboards()).SuperAdminPanelRoute }),
    },
  ],
};

export const areaRoutes: RouteObject[] = [
  buildAreaRoute('Parent'),
  buildAreaRoute('Teacher'),
  buildAreaRoute('Specialist'),
  buildAreaRoute('Admin'),
  superAdminRoute,
];
