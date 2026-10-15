import { ADMIN_PATHS, ADMIN_SEGMENTS } from '@/constants/routes';
import { renderWithRouter } from '@/test/renderWithRouter';
import { signInAs } from '@/test/session';

import { ActivitiesPage } from '@/features/content/pages/ActivitiesPage';
import { ActivityDetailPage } from '@/features/content/pages/ActivityDetailPage';
import { CategoriesPage } from '@/features/content/pages/CategoriesPage';
import { InitialAssessmentAdminPage } from '@/features/content/pages/InitialAssessmentAdminPage';

const contentRoutes = [
  { path: ADMIN_PATHS.categories, element: <CategoriesPage /> },
  { path: ADMIN_PATHS.activities, element: <ActivitiesPage /> },
  { path: `/admin/${ADMIN_SEGMENTS.activityDetail}`, element: <ActivityDetailPage /> },
  { path: ADMIN_PATHS.initialAssessment, element: <InitialAssessmentAdminPage /> },
];

/** Renders the admin content pages (without the shell) signed in as Admin. */
export function renderContent(path: string) {
  signInAs('Admin');
  return renderWithRouter(contentRoutes, path);
}

export const LETTERS_TEST_ID = 'a0000000-0000-4000-8000-000000000001';
