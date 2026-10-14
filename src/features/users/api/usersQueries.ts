import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import {
  assignChildrenToSpecialist,
  fetchAdminUser,
  fetchAdminUsers,
  fetchSpecialists,
  type AssignSpecialistInput,
} from './usersApi';

export function useAdminUsers(role = '', search = '') {
  return useQuery({
    queryKey: queryKeys.users.admin(role, search),
    queryFn: () => fetchAdminUsers(role, search),
  });
}

/** Specialists for the assignment picker (`GET Admin/specialists`). */
export function useAdminSpecialists() {
  return useQuery({ queryKey: queryKeys.users.specialists(), queryFn: fetchSpecialists });
}

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.adminDetail(userId ?? ''),
    queryFn: () => fetchAdminUser(userId ?? ''),
    enabled: Boolean(userId),
  });
}

/** Assigns children to a specialist, then refreshes user and children data everywhere. */
export function useAssignSpecialist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignSpecialistInput) => assignChildrenToSpecialist(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.children.all }),
      ]);
    },
  });
}
