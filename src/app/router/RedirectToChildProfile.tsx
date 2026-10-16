import { Navigate, useParams } from 'react-router';

import { useRoleArea } from '@/hooks/useRoleArea';

/**
 * Old teacher deep links (`children/:childId/plans`, `children/:childId/notes`) now open the
 * child's plan-focused page, where the plan and the notes live (client revision 2026-10).
 */
export function RedirectToChildProfile() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  return <Navigate to={paths.childProfile(childId)} replace />;
}
