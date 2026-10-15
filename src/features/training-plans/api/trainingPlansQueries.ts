import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityType } from '@/services/api/activityType';
import { queryKeys } from '@/services/api/queryKeys';

import {
  assignActivity,
  assignTeacher,
  fetchAvailableActivities,
  fetchPlanActivityResult,
  fetchSpecialistPlan,
  fetchTeachers,
  removeActivity,
} from './trainingPlansApi';

const TEACHERS_KEY = [...queryKeys.trainingPlans.all, 'teachers'] as const;

export function useTeachers(enabled: boolean) {
  return useQuery({ queryKey: TEACHERS_KEY, queryFn: fetchTeachers, enabled });
}

/** Assigns a teacher to children; refreshes the plans and the children lists (teacher names). */
export function useAssignTeacherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, childIds }: { teacherId: string; childIds: readonly string[] }) =>
      assignTeacher(teacherId, childIds),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trainingPlans.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.children.all }),
      ]);
    },
  });
}

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

/** A submitted activity's result (Specialist only), loaded when the specialist opens it. */
export function usePlanActivityResult(childId: string, planActivityId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.activityResult(childId, planActivityId),
    queryFn: () => fetchPlanActivityResult(childId, planActivityId),
    enabled,
  });
}
