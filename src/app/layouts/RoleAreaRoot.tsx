import { Outlet } from 'react-router';

import type { AreaRole } from '@/constants/routes';
import { RoleAreaContext } from '@/hooks/useRoleArea';

export interface RoleAreaRootProps {
  role: AreaRole;
}

/** Provides the role area to every page (shell pages and full-screen activity pages). */
export function RoleAreaRoot({ role }: RoleAreaRootProps) {
  return (
    <RoleAreaContext value={role}>
      <Outlet />
    </RoleAreaContext>
  );
}
