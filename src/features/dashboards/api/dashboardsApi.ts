import { useQuery } from '@tanstack/react-query';

import { normalizeRole } from '@/constants/backendRoles';
import { queryKeys } from '@/services/api/queryKeys';
import { httpClient } from '@/services/http/httpClient';
import type { UserRole } from '@/types/roles';

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

async function fetchDashboard(kind: DashboardKind): Promise<unknown> {
  const { data } = await httpClient.get<unknown>(DASHBOARD_PATHS[kind]);
  return data;
}

export async function fetchDashboardStats(kind: DashboardKind): Promise<DashboardStat[]> {
  return toDashboardStats(await fetchDashboard(kind));
}

export function useDashboardStats(kind: DashboardKind) {
  return useQuery({
    queryKey: queryKeys.dashboards[kind](),
    queryFn: () => fetchDashboard(kind),
    select: toDashboardStats,
  });
}

export interface RoleCount {
  role: UserRole;
  count: number;
}

/**
 * `usersByRole` from `GET SuperAdmin/dashboard` — VERIFIED LIVE 2026-10-15:
 * `[{ role: "أخصائي/ة" | "ولي أمر" | "معلم/ة" | "Admin" | "SuperAdmin", count }]`.
 * Entries with an unknown role are left out (never guessed); null when the field is missing.
 */
export function toUsersByRole(data: unknown): RoleCount[] | null {
  if (typeof data !== 'object' || data === null) return null;
  const list = (data as { usersByRole?: unknown }).usersByRole;
  if (!Array.isArray(list)) return null;
  const counts: RoleCount[] = [];
  for (const item of list as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const { role, count } = item as { role?: unknown; count?: unknown };
    const normalized = normalizeRole(role);
    if (normalized && typeof count === 'number' && Number.isFinite(count)) {
      counts.push({ role: normalized, count });
    }
  }
  return counts;
}

/** Super Admin per-role counts, from the same cached dashboard response as the stat cards. */
export function useUsersByRole() {
  return useQuery({
    queryKey: queryKeys.dashboards.superAdmin(),
    queryFn: () => fetchDashboard('superAdmin'),
    select: toUsersByRole,
  });
}
