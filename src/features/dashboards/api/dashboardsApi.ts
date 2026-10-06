import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';
import { httpClient } from '@/services/http/httpClient';

import type { DashboardStat } from '../types';

import { toDashboardStats } from './dashboardStats';

/** Role dashboard endpoints (Swagger). Response shapes undocumented → lenient stat mapping. */
export const DASHBOARD_PATHS = {
  teacher: 'Teacher/dashboard',
  specialist: 'specialist/dashboard',
  admin: 'Admin/dashboard',
  superAdmin: 'SuperAdmin/dashboard',
} as const;

export type DashboardKind = keyof typeof DASHBOARD_PATHS;

export async function fetchDashboardStats(kind: DashboardKind): Promise<DashboardStat[]> {
  const { data } = await httpClient.get<unknown>(DASHBOARD_PATHS[kind]);
  return toDashboardStats(data);
}

export function useDashboardStats(kind: DashboardKind) {
  return useQuery({
    queryKey: queryKeys.dashboards[kind](),
    queryFn: () => fetchDashboardStats(kind),
  });
}
