import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import {
  createChild,
  deleteChild,
  fetchParentChild,
  updateChild,
  type ChildInput,
} from './childrenApi';

/** The parent's own child (`GET Parent/{childId}`). */
export function useParentChild(childId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.children.detail(childId),
    queryFn: () => fetchParentChild(childId),
    enabled: enabled && Boolean(childId),
  });
}

/** Every child mutation refreshes all child lists and details (no stale cards after a change). */
function useInvalidateChildren() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
}

export function useCreateChild() {
  const invalidate = useInvalidateChildren();
  return useMutation({ mutationFn: createChild, onSuccess: invalidate });
}

export function useUpdateChild(childId: string) {
  const invalidate = useInvalidateChildren();
  return useMutation({
    mutationFn: (input: ChildInput) => updateChild(childId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChild,
    onSuccess: (_data, childId) => {
      queryClient.removeQueries({ queryKey: queryKeys.children.detail(childId) });
      queryClient.removeQueries({ queryKey: queryKeys.reports.byChild(childId) });
      queryClient.removeQueries({ queryKey: [...queryKeys.trainingPlans.all, 'child', childId] });
      return queryClient.invalidateQueries({ queryKey: queryKeys.children.all });
    },
  });
}
