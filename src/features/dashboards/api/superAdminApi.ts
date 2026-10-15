import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { normalizeRole } from '@/constants/backendRoles';
import {
  childListItemSchema,
  mapChildSummary,
  type ChildSummary,
} from '@/services/api/childrenLists';
import { queryKeys } from '@/services/api/queryKeys';
import { httpClient } from '@/services/http/httpClient';
import type { UserRole } from '@/types/roles';

/**
 * Super Admin reads — VERIFIED LIVE (2026-10-06):
 * - `SuperAdmin/users?Search=&Role=` → array of `{ id, fullName, email, role, emailConfirmed }`
 * - `SuperAdmin/children?Name=` → array of `{ id, fullName, age, gender, parentId, parentName }`
 * Role values include `Admin` and `SuperAdmin` (English) besides the Arabic ones.
 * User management (added 2026-10-14, Super Admin only — Admin 403), verified live with one
 * disposable teacher: `POST SuperAdmin/users { fullName, email, password, role }` → 201
 * `{ message, id, fullName, email, role, isActive }`; `DELETE SuperAdmin/users/{id}` → 200 "User
 * deactivated successfully." (soft: the user stays listed, and login is refused).
 * Since 2026-10-15 the list returns `isActive` (VERIFIED LIVE), so a deactivated account is shown
 * as such and can be re-activated with `PUT SuperAdmin/users/{id} { fullName, email, role,
 * isActive: true }` (200 live; the user's own values are sent back unchanged).
 */
const userItemSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  role: z.string().nullish(),
  emailConfirmed: z.boolean().nullish(),
  childrenCount: z.number().nullish(),
  isActive: z.boolean().nullish(),
});

const usersResponseSchema = z.union([
  z.array(userItemSchema),
  z.looseObject({ users: z.array(userItemSchema) }),
]);

export interface PanelUser {
  id: string;
  name: string;
  email: string | null;
  /** Canonical role, or null when the backend value is unknown (raw value kept for display). */
  role: UserRole | null;
  roleValue: string;
  /** From the server; null when it was not sent (then neither state is claimed). */
  isActive: boolean | null;
}

/** Role values as the backend sends them — all five VERIFIED LIVE (user lists, login). */
export const ROLE_WIRE_VALUES: Partial<Record<UserRole, string>> = {
  Parent: 'ولي أمر',
  Teacher: 'معلم/ة',
  Specialist: 'أخصائي/ة',
  Admin: 'Admin',
  SuperAdmin: 'SuperAdmin',
};

export async function fetchSuperAdminUsers(role: string, search: string): Promise<PanelUser[]> {
  const { data } = await httpClient.get<unknown>('SuperAdmin/users', {
    params: { ...(role ? { Role: role } : {}), ...(search ? { Search: search } : {}) },
  });
  const parsed = usersResponseSchema.parse(data);
  const items = Array.isArray(parsed) ? parsed : parsed.users;
  return items.map((item) => ({
    id: item.id,
    name: item.fullName ?? '',
    email: item.email ?? null,
    role: normalizeRole(item.role),
    roleValue: item.role ?? '',
    isActive: item.isActive ?? null,
  }));
}

/** Staff roles the Super Admin creates (wire values; public registration creates parents). */
export const STAFF_ROLES = ['Teacher', 'Specialist'] as const satisfies readonly UserRole[];
export type StaffRole = (typeof STAFF_ROLES)[number];

export interface CreateStaffInput {
  fullName: string;
  email: string;
  password: string;
  role: StaffRole;
}

export async function createStaffUser(input: CreateStaffInput): Promise<void> {
  await httpClient.post('SuperAdmin/users', {
    fullName: input.fullName,
    email: input.email,
    password: input.password,
    role: ROLE_WIRE_VALUES[input.role],
  });
}

export async function deactivateUser(userId: string): Promise<void> {
  await httpClient.delete(`SuperAdmin/users/${encodeURIComponent(userId)}`);
}

/** Re-activates a deactivated account, sending its own name, email and backend role back. */
export async function reactivateUser(user: PanelUser): Promise<void> {
  await httpClient.put(`SuperAdmin/users/${encodeURIComponent(user.id)}`, {
    fullName: user.name,
    email: user.email,
    role: user.roleValue,
    isActive: true,
  });
}

export async function fetchSuperAdminChildren(name: string): Promise<ChildSummary[]> {
  const { data } = await httpClient.get<unknown>('SuperAdmin/children', {
    params: name ? { Name: name } : undefined,
  });
  return z.array(childListItemSchema).parse(data).map(mapChildSummary);
}

export function useSuperAdminUsers(role = '', search = '') {
  return useQuery({
    queryKey: queryKeys.users.superAdmin(role, search),
    queryFn: () => fetchSuperAdminUsers(role, search),
  });
}

export function useSuperAdminChildren(name = '') {
  return useQuery({
    queryKey: [...queryKeys.children.all, 'superAdmin', name] as const,
    queryFn: () => fetchSuperAdminChildren(name),
  });
}

function useRefreshUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
}

export function useCreateStaffUser() {
  const refresh = useRefreshUsers();
  return useMutation({ mutationFn: createStaffUser, onSuccess: refresh });
}

export function useReactivateUser() {
  const refresh = useRefreshUsers();
  return useMutation({ mutationFn: reactivateUser, onSuccess: refresh });
}

export function useDeactivateUser() {
  const refresh = useRefreshUsers();
  return useMutation({ mutationFn: deactivateUser, onSuccess: refresh });
}
