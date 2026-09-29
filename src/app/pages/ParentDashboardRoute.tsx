import { MOCK_PARENT_USER } from '@/app/dev/mockParentSession';
import { ParentDashboardPage } from '@/features/dashboards';

/** Route element: supplies the (mock) signed-in parent to the dashboard feature. */
export function ParentDashboardRoute() {
  return <ParentDashboardPage parentName={MOCK_PARENT_USER.name} />;
}
