import { z } from 'zod';

import type { AreaRole } from '@/constants/routes';
import { httpClient } from '@/services/http/httpClient';

/**
 * Children visible to the signed-in role (shared by children, dashboards, reports, chat…).
 * VERIFIED LIVE (2026-10-06):
 * - `GET Parent/GetMyChildren` → `{ id, fullName, age, gender, parentId }`
 * - `GET specialist/children` → `{ id, fullName, parentId, parentName, age, gender, progressPercentage }`
 * - `Teacher/children` — not verified (no teacher demo account yet).
 * Gender values are Arabic (`بنت` / `ولد`). Admin has no children-list endpoint (BLOCKED BY BACKEND).
 */
export const childListItemSchema = z.looseObject({
  id: z.string(),
  fullName: z.string().nullish(),
  age: z.number().nullish(),
  birthDate: z.string().nullish(),
  gender: z.string().nullish(),
  parentId: z.string().nullish(),
  parentName: z.string().nullish(),
  specialistId: z.string().nullish(),
  specialistName: z.string().nullish(),
  teacherId: z.string().nullish(),
  teacherName: z.string().nullish(),
  progressPercentage: z.number().nullish(),
});

export type ChildGenderValue = 'ولد' | 'بنت';

export interface ChildSummary {
  id: string;
  fullName: string;
  /** Integer age from the API (Swagger `Age:int32`); null when only a birth date is returned. */
  age: number | null;
  birthDate: string | null;
  gender: ChildGenderValue | null;
  parentName: string | null;
  specialistName: string | null;
  teacherName: string | null;
  /** Server-computed plan progress (specialist list only). */
  progressPercentage: number | null;
}

/** Backend gender values are Arabic (`ولد`/`بنت`); some responses use `Male`/`Female`. */
export function normalizeGender(value: unknown): ChildGenderValue | null {
  if (value === 'ولد' || value === 'Male' || value === 'male') return 'ولد';
  if (value === 'بنت' || value === 'Female' || value === 'female') return 'بنت';
  return null;
}

export function mapChildSummary(dto: z.infer<typeof childListItemSchema>): ChildSummary {
  return {
    id: dto.id,
    fullName: dto.fullName ?? '',
    age: dto.age ?? null,
    birthDate: dto.birthDate ?? null,
    gender: normalizeGender(dto.gender),
    parentName: dto.parentName ?? null,
    specialistName: dto.specialistName ?? null,
    teacherName: dto.teacherName ?? null,
    progressPercentage: dto.progressPercentage ?? null,
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
