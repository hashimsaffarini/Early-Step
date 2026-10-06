import { useQuery } from '@tanstack/react-query';
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
 * No create / edit / delete / role-change endpoints exist (BLOCKED BY BACKEND).
 */
const userItemSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  role: z.string().nullish(),
  emailConfirmed: z.boolean().nullish(),
  childrenCount: z.number().nullish(),
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
  }));
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
