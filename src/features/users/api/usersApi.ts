import { z } from 'zod';

import { normalizeRole } from '@/constants/backendRoles';
import {
  childListItemSchema,
  mapChildSummary,
  type ChildSummary,
} from '@/services/api/childrenLists';
import { httpClient } from '@/services/http/httpClient';
import type { UserRole } from '@/types/roles';

/**
 * Admin users (Swagger `Admin/users?Role=&Search=`, `Admin/users/{userId}`, `Admin/specialists`,
 * `POST Admin/assign-children-to-specialist`). List shape matches the documented
 * `{ totalUsers, totalParents, totalSpecialists, totalTeachers, users[] }`; detail (verified live)
 * is the user + `children: [{ …, specialistName | null }]`. Creating / editing / deactivating staff is a Super Admin capability
 * (`SuperAdmin/users`), not an Admin one.
 */
const userItemSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  role: z.string().nullish(),
  emailConfirmed: z.boolean().nullish(),
  childrenCount: z.number().nullish(),
});

const usersResponseSchema = z.looseObject({
  totalUsers: z.number().nullish(),
  totalParents: z.number().nullish(),
  totalSpecialists: z.number().nullish(),
  totalTeachers: z.number().nullish(),
  users: z.array(userItemSchema),
});

const userDetailSchema = userItemSchema.extend({
  // Always sent live; required so a missing list is an error, not "no children".
  children: z.array(childListItemSchema),
});

export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  role: UserRole | null;
  /** Role exactly as the backend sent it (shown when it is not a known role). */
  roleValue: string;
  emailConfirmed: boolean | null;
  childrenCount: number | null;
}

export interface AdminUsersTotals {
  totalUsers: number | null;
  totalParents: number | null;
  totalSpecialists: number | null;
  totalTeachers: number | null;
}

export interface AdminUsersResult {
  totals: AdminUsersTotals;
  users: AdminUser[];
}

export interface AdminUserDetail extends AdminUser {
  children: ChildSummary[];
}

/** Role filter values as the backend sends them (observed live). */
export const ROLE_WIRE_VALUES = {
  Parent: 'ولي أمر',
  Teacher: 'معلم/ة',
  Specialist: 'أخصائي/ة',
} as const satisfies Partial<Record<UserRole, string>>;

export type FilterableRole = keyof typeof ROLE_WIRE_VALUES;

function mapUser(dto: z.infer<typeof userItemSchema>): AdminUser {
  return {
    id: dto.id,
    name: dto.fullName ?? '',
    email: dto.email ?? null,
    role: normalizeRole(dto.role),
    roleValue: dto.role ?? '',
    emailConfirmed: dto.emailConfirmed ?? null,
    childrenCount: dto.childrenCount ?? null,
  };
}

export async function fetchAdminUsers(role: string, search: string): Promise<AdminUsersResult> {
  const { data } = await httpClient.get<unknown>('Admin/users', {
    params: { ...(role ? { Role: role } : {}), ...(search ? { Search: search } : {}) },
  });
  const parsed = usersResponseSchema.parse(data);
  return {
    totals: {
      totalUsers: parsed.totalUsers ?? null,
      totalParents: parsed.totalParents ?? null,
      totalSpecialists: parsed.totalSpecialists ?? null,
      totalTeachers: parsed.totalTeachers ?? null,
    },
    users: parsed.users.map(mapUser),
  };
}

export async function fetchAdminUser(userId: string): Promise<AdminUserDetail> {
  const { data } = await httpClient.get<unknown>(`Admin/users/${encodeURIComponent(userId)}`);
  const dto = userDetailSchema.parse(data);
  return {
    ...mapUser(dto),
    children: dto.children.map(mapChildSummary),
  };
}

/** `GET Admin/specialists` ("Get Sp") — VERIFIED LIVE 2026-10-14 (Admin only; 403 for others). */
const specialistSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  email: z.string().nullish(),
  // Always sent live; required so an unknown state is never shown as active.
  isActive: z.boolean(),
});

export interface AdminSpecialist {
  id: string;
  name: string;
  email: string | null;
  /** Deactivated specialists stay listed; they cannot receive new children. */
  isActive: boolean;
}

export async function fetchSpecialists(): Promise<AdminSpecialist[]> {
  const { data } = await httpClient.get<unknown>('Admin/specialists');
  return z
    .array(specialistSchema)
    .parse(data)
    .map((dto) => ({
      id: dto.id,
      name: dto.fullName?.trim() ?? '',
      email: dto.email ?? null,
      isActive: dto.isActive,
    }));
}

export interface AssignSpecialistInput {
  specialistId: string;
  childIds: string[];
}

export async function assignChildrenToSpecialist(input: AssignSpecialistInput): Promise<void> {
  await httpClient.post('Admin/assign-children-to-specialist', input);
}

/**
 * Every child the Admin can assign (client revision 2026-10). The API has no Admin children list,
 * so the children come from the parents' details: `GET Admin/users?Role=ولي أمر`, then
 * `GET Admin/users/{parentId}` for each parent that has children (`childrenCount > 0`; a parent
 * whose count is not sent is read too). Each child keeps its server `specialistName`.
 */
export async function fetchAssignableChildren(): Promise<ChildSummary[]> {
  const { users } = await fetchAdminUsers(ROLE_WIRE_VALUES.Parent, '');
  const parents = users.filter((user) => user.childrenCount === null || user.childrenCount > 0);
  const details = await Promise.all(parents.map((parent) => fetchAdminUser(parent.id)));
  return details
    .flatMap((detail) => detail.children)
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'ar'));
}
