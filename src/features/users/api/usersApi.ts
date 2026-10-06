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
 * Admin users (Swagger `Admin/users?Role=&Search=`, `Admin/users/{userId}`,
 * `POST Admin/assign-children-to-specialist`). List shape matches the documented
 * `{ totalUsers, totalParents, totalSpecialists, totalTeachers, users[] }`; detail follows the
 * Apidog example. The API has no create / edit / delete user endpoints (BLOCKED BY BACKEND).
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
  phoneNumber: z.string().nullish(),
  children: z.array(childListItemSchema).nullish(),
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
  phoneNumber: string | null;
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
    phoneNumber: dto.phoneNumber ?? null,
    children: (dto.children ?? []).map(mapChildSummary),
  };
}

export interface AssignSpecialistInput {
  specialistId: string;
  childIds: string[];
}

export async function assignChildrenToSpecialist(input: AssignSpecialistInput): Promise<void> {
  await httpClient.post('Admin/assign-children-to-specialist', input);
}
