import { useQuery } from '@tanstack/react-query';

import { fetchChildPlanActivities, fetchChildPlanSummary } from '@/services/api/childPlan';
import { fetchChildReports } from '@/services/api/childReports';
import { queryKeys } from '@/services/api/queryKeys';

/** Shared reads used by several features (same key → same cached shape everywhere). */
export function useChildReports(childId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.reports.byChild(childId ?? ''),
    queryFn: () => fetchChildReports(childId ?? ''),
    enabled: Boolean(childId),
  });
}

export function useChildPlanActivities(childId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.childActivities(childId ?? ''),
    queryFn: () => fetchChildPlanActivities(childId ?? ''),
    enabled: Boolean(childId),
  });
}

export function useChildPlanSummary(childId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.childSummary(childId ?? ''),
    queryFn: () => fetchChildPlanSummary(childId ?? ''),
    enabled: Boolean(childId),
  });
}
