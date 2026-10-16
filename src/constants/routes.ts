import type { UserRole } from '@/types/roles';

/**
 * Centralized route paths. Never hardcode path strings in components —
 * import them from here. Lives in a shared layer so features can link to each
 * other's routes without importing `app/` (ADR-018).
 *
 * Only routes that actually exist are listed.
 */
export const ROUTE_PATHS = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  parentRoot: '/parent',
  parentDashboard: '/parent/dashboard',
  parentChildren: '/parent/children',
  parentChildProfile: '/parent/children/:childId',
  superAdmin: '/super-admin',
  unauthorized: '/unauthorized',
} as const;

/** Where a signed-in user lands (area roots redirect to their dashboard). */
export function getRoleHomePath(role: UserRole): string {
  return ROLE_NAMESPACES[role];
}

/** URL namespace for each role's area. */
export const ROLE_NAMESPACES = {
  Parent: '/parent',
  Teacher: '/teacher',
  Specialist: '/specialist',
  Admin: '/admin',
  SuperAdmin: '/super-admin',
} as const satisfies Record<UserRole, `/${string}`>;

/**
 * Roles that share the standard area (dashboard, children, tests, games, reports, messages).
 * The Super Admin has its own single panel at `ROUTE_PATHS.superAdmin`.
 */
export type AreaRole = Exclude<UserRole, 'SuperAdmin'>;

/** Route segments inside every role area (relative to the role namespace). */
export const AREA_SEGMENTS = {
  dashboard: 'dashboard',
  children: 'children',
  childProfile: 'children/:childId',
  childPlans: 'children/:childId/plans',
  /** Teacher feedback notes for a child (Teacher only). */
  childNotes: 'children/:childId/notes',
  tests: 'tests',
  testPlay: 'tests/:testId/play',
  games: 'games',
  gamePlay: 'games/:gameId/play',
  assessment: 'assessment/:childId',
  reports: 'reports',
  reportCreate: 'reports/new',
  reportDetail: 'reports/:reportId',
  reportEdit: 'reports/:reportId/edit',
  /** A training-plan activity played by the child (test questions from the plan). */
  planActivityPlay: 'children/:childId/activities/:activityId/play',
  messages: 'messages',
} as const;

/** Admin-only segments (under `/admin`): users and content management (no Replit UI). */
export const ADMIN_SEGMENTS = {
  content: 'content',
  users: 'users',
  userDetail: 'users/:userId',
  specialists: 'specialists',
  categories: 'content/categories',
  activities: 'content/activities',
  activityDetail: 'content/activities/:activityType/:activityId',
  initialAssessment: 'content/initial-assessment',
} as const;

export const ADMIN_PATHS = {
  content: `/admin/${ADMIN_SEGMENTS.content}`,
  users: `/admin/${ADMIN_SEGMENTS.users}`,
  specialists: `/admin/${ADMIN_SEGMENTS.specialists}`,
  categories: `/admin/${ADMIN_SEGMENTS.categories}`,
  activities: `/admin/${ADMIN_SEGMENTS.activities}`,
  initialAssessment: `/admin/${ADMIN_SEGMENTS.initialAssessment}`,
  userDetail: (userId: string) => `/admin/users/${encodeURIComponent(userId)}`,
  activityDetail: (activityType: string, activityId: string) =>
    `/admin/content/activities/${encodeURIComponent(activityType)}/${encodeURIComponent(activityId)}`,
} as const;

/**
 * Roles that can create/edit/delete reports. The API exposes these only under `/specialist/*`
 * (Swagger tag "Specialist"), so only the Specialist (Replit also allowed Admin — no admin endpoint).
 */
export const REPORT_AUTHOR_ROLES = ['Specialist'] as const satisfies readonly AreaRole[];

export function canCreateReports(role: AreaRole): boolean {
  return (REPORT_AUTHOR_ROLES as readonly AreaRole[]).includes(role);
}

/** Concrete, role-scoped paths. Builders encode ids. */
export interface AreaPaths {
  root: string;
  dashboard: string;
  children: string;
  tests: string;
  games: string;
  reports: string;
  reportCreate: string;
  messages: string;
  childProfile: (childId: string) => string;
  childPlans: (childId: string) => string;
  childNotes: (childId: string) => string;
  testPlay: (testId: string) => string;
  gamePlay: (gameId: string) => string;
  assessment: (childId: string) => string;
  reportDetail: (reportId: string) => string;
  reportEdit: (reportId: string) => string;
  planActivityPlay: (childId: string, activityId: string) => string;
}

export function getAreaPaths(role: AreaRole): AreaPaths {
  const root = ROLE_NAMESPACES[role];
  const at = (segment: string) => `${root}/${segment}`;
  const withId = (segment: string, param: string) => (id: string) =>
    at(segment.replace(param, encodeURIComponent(id)));

  return {
    root,
    dashboard: at(AREA_SEGMENTS.dashboard),
    children: at(AREA_SEGMENTS.children),
    tests: at(AREA_SEGMENTS.tests),
    games: at(AREA_SEGMENTS.games),
    reports: at(AREA_SEGMENTS.reports),
    reportCreate: at(AREA_SEGMENTS.reportCreate),
    messages: at(AREA_SEGMENTS.messages),
    childProfile: withId(AREA_SEGMENTS.childProfile, ':childId'),
    childPlans: withId(AREA_SEGMENTS.childPlans, ':childId'),
    childNotes: withId(AREA_SEGMENTS.childNotes, ':childId'),
    testPlay: withId(AREA_SEGMENTS.testPlay, ':testId'),
    gamePlay: withId(AREA_SEGMENTS.gamePlay, ':gameId'),
    assessment: withId(AREA_SEGMENTS.assessment, ':childId'),
    reportDetail: withId(AREA_SEGMENTS.reportDetail, ':reportId'),
    reportEdit: withId(AREA_SEGMENTS.reportEdit, ':reportId'),
    planActivityPlay: (childId: string, activityId: string) =>
      at(
        AREA_SEGMENTS.planActivityPlay
          .replace(':childId', encodeURIComponent(childId))
          .replace(':activityId', encodeURIComponent(activityId)),
      ),
  };
}

/** `/parent/children/<id>` for a child profile link. */
export function buildParentChildProfilePath(childId: string): string {
  return getAreaPaths('Parent').childProfile(childId);
}

/** Development-only UI preview (not registered in production builds). */
export const DEV_PREVIEW_PATHS = {
  root: '/ui-preview',
  components: '/ui-preview/components',
  forms: '/ui-preview/forms',
  child: '/ui-preview/child',
} as const;
