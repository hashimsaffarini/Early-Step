import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityType } from '@/services/api/activityType';
import { queryKeys } from '@/services/api/queryKeys';

import {
  assignActivity,
  fetchAvailableActivities,
  fetchSpecialistPlan,
  removeActivity,
} from './trainingPlansApi';

export function useSpecialistPlan(childId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.specialistPlan(childId),
    queryFn: () => fetchSpecialistPlan(childId),
    enabled,
  });
}

export function useAvailableActivities(childId: string, type: ActivityType, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.available(childId, type),
    queryFn: () => fetchAvailableActivities(childId, type),
    enabled,
  });
}

/** Everything cached about this child's plan (specialist + shared child views). */
function useInvalidateChildPlan(childId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.trainingPlans.all, 'specialist', childId],
      }),
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.trainingPlans.all, 'child', childId],
      }),
    ]);
  };
}

export function useAssignActivityMutation(childId: string) {
  const invalidate = useInvalidateChildPlan(childId);
  return useMutation({
    mutationFn: (activityId: string) => assignActivity(childId, activityId),
    onSuccess: invalidate,
  });
}

export function useRemoveActivityMutation(childId: string) {
  const invalidate = useInvalidateChildPlan(childId);
  return useMutation({
    mutationFn: (activityId: string) => removeActivity(childId, activityId),
    onSuccess: invalidate,
  });
}
