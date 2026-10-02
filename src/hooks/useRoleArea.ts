import { createContext, useContext } from 'react';

import { getAreaPaths, type AreaPaths, type AreaRole } from '@/constants/routes';

/**
 * The role area a page is rendered in (set by the role's route in `app/router`).
 * Pages shared by several roles (children, tests, games, reports, messages) read it to build
 * role-scoped links and to vary role-specific UI. Display/navigation only — not access control.
 * Defaults to Parent so pages render in isolation (tests, previews).
 */
export const RoleAreaContext = createContext<AreaRole>('Parent');

export interface RoleArea {
  role: AreaRole;
  paths: AreaPaths;
}

export function useRoleArea(): RoleArea {
  const role = useContext(RoleAreaContext);
  return { role, paths: getAreaPaths(role) };
}
