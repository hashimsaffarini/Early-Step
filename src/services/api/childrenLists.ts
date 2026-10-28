import { z } from 'zod';
import { MIN_CHILD_AGE, MAX_CHILD_AGE } from '@/constants/children';

import type { AreaRole } from '@/constants/routes';
import { httpClient } from '@/services/http/httpClient';

/**
 * Children visible to the signed-in role (shared by children, dashboards, reports, chat…).
 * VERIFIED LIVE (2026-10-06):
 * - `GET Parent/GetMyChildren` → `{ id, fullName, age, gender, parentId }`
 * - `GET specialist/children` → `{ id, fullName, parentId, parentName, age, gender, progressPercentage }`
 *   (`progressPercentage` stays 0 while the plan progresses, so it is not mapped — BACKEND_REQUESTS)
 * - `Teacher/children` — not verified (no working teacher account).
 * Gender values are Arabic (`بنت` / `ولد`). Admin has no children-list endpoint.
 */
export const childListItemSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  age: z.number().nullish(),
  gender: z.string().nullish(),
  parentName: z.string().nullish(),
  specialistName: z.string().nullish(),
  teacherName: z.string().nullish(),
});

export type ChildGenderValue = 'ولد' | 'بنت';

export interface ChildSummary {
  id: string;
  fullName: string;
  /** Integer age from the API (Swagger `Age:int32`). */
  age: number | null;
  gender: ChildGenderValue | null;
  parentName: string | null;
  specialistName: string | null;
  teacherName: string | null;
}

/** Backend gender values are Arabic (`ولد` / `بنت`, verified live); anything else is unknown. */
export function normalizeGender(value: unknown): ChildGenderValue | null {
  return value === 'ولد' || value === 'بنت' ? value : null;
}

export function mapChildSummary(dto: z.infer<typeof childListItemSchema>): ChildSummary {
  return {
    id: dto.id,
    fullName: dto.fullName ?? '',
    age:
      dto.age !== null &&
      dto.age !== undefined &&
      Number.isInteger(dto.age) &&
      dto.age >= MIN_CHILD_AGE &&
      dto.age <= MAX_CHILD_AGE
        ? dto.age
        : null,
    gender: normalizeGender(dto.gender),
    parentName: dto.parentName ?? null,
    specialistName: dto.specialistName ?? null,
    teacherName: dto.teacherName ?? null,
  };
}

/** Role → its children-list endpoint. Admin: none in the API. */
export const CHILDREN_LIST_PATH: Record<AreaRole, string | null> = {
  Parent: 'Parent/GetMyChildren',
  Teacher: 'Teacher/children',
  Specialist: 'specialist/children',
  Admin: null,
};

export async function fetchChildrenForRole(role: AreaRole): Promise<ChildSummary[]> {
  const path = CHILDREN_LIST_PATH[role];
  if (!path) return [];
  const { data } = await httpClient.get<unknown>(path);
  return z.array(childListItemSchema).parse(data).map(mapChildSummary);
}

/**
 * `GET Parent/{childId}` (the parent's own child) — VERIFIED LIVE 2026-10-16:
 * `{ id, fullName, age, gender, gamesCount, testsCount, reportsCount }`.
 */
const parentChildDetailSchema = childListItemSchema.extend({
  gamesCount: z.number().nullish(),
  testsCount: z.number().nullish(),
  reportsCount: z.number().nullish(),
});

export interface ParentChildDetail extends ChildSummary {
  /** Counts the server sends for the child (null when not sent — never shown as 0). */
  testsCount: number | null;
  gamesCount: number | null;
  reportsCount: number | null;
}

export const PARENT_CHILD_PATH = (childId: string) => `Parent/${encodeURIComponent(childId)}`;

export async function fetchParentChildDetail(childId: string): Promise<ParentChildDetail> {
  const { data } = await httpClient.get<unknown>(PARENT_CHILD_PATH(childId));
  const dto = parentChildDetailSchema.parse(data);
  return {
    ...mapChildSummary(dto),
    testsCount: dto.testsCount ?? null,
    gamesCount: dto.gamesCount ?? null,
    reportsCount: dto.reportsCount ?? null,
  };
}
