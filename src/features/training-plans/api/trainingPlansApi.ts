import { z } from 'zod';

import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';
import {
  mapPlanActivity,
  planActivityDtoSchema,
  type PlanActivity,
} from '@/services/api/childPlan';
import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import { HTTP_STATUS } from '@/services/http/httpStatus';

const childBase = (childId: string) =>
  `TrainingPlan/specialist/children/${encodeURIComponent(childId)}`;

export const TRAINING_PLAN_PATHS = {
  specialistPlan: childBase,
  available: (childId: string) => `${childBase(childId)}/available-activities`,
  activities: (childId: string) => `${childBase(childId)}/activities`,
  activity: (childId: string, activityId: string) =>
    `${childBase(childId)}/activities/${encodeURIComponent(activityId)}`,
} as const;

export interface SpecialistPlan {
  /** False when the backend answers 404 "لا توجد خطة تدريبية لهذا الطفل." (no plan yet). */
  hasPlan: boolean;
  /** Plan status as sent by the backend (live value: `Active`). */
  status: string | null;
  teacherId: string | null;
  teacherName: string | null;
  activities: PlanActivity[];
}

/** VERIFIED LIVE (2026-10-06): the specialist plan object. */
const planSchema = z.looseObject({
  id: z.string(),
  childId: z.string(),
  childName: z.string().nullish(),
  specialistId: z.string().nullish(),
  specialistName: z.string().nullish(),
  teacherId: z.string().nullish(),
  teacherName: z.string().nullish(),
  status: z.string().nullish(),
  activities: z.array(planActivityDtoSchema),
});

const NO_PLAN: SpecialistPlan = {
  hasPlan: false,
  status: null,
  teacherId: null,
  teacherName: null,
  activities: [],
};

export function parseSpecialistPlan(data: unknown): SpecialistPlan {
  const plan = planSchema.parse(data);
  return {
    hasPlan: true,
    status: plan.status ?? null,
    teacherId: plan.teacherId ?? null,
    teacherName: plan.teacherName ?? null,
    activities: plan.activities.map(mapPlanActivity),
  };
}

const NO_PLAN_MESSAGE = 'لا توجد خطة تدريبية';

/** `GET TrainingPlan/specialist/children/{childId}` — 404 + "no plan" message → `hasPlan: false`. */
export async function fetchSpecialistPlan(childId: string): Promise<SpecialistPlan> {
  try {
    const { data } = await httpClient.get<unknown>(TRAINING_PLAN_PATHS.specialistPlan(childId));
    return parseSpecialistPlan(data);
  } catch (error) {
    if (
      error instanceof AppError &&
      error.status === HTTP_STATUS.NOT_FOUND &&
      error.message.includes(NO_PLAN_MESSAGE)
    ) {
      return NO_PLAN;
    }
    throw error;
  }
}

/** Available-activity item — VERIFIED LIVE (2026-10-06). */
const availableActivitySchema = z.looseObject({
  id: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  iconUrl: z.string().nullish(),
  type: z.string().nullish(),
  categoryId: z.string().nullish(),
  categoryName: z.string().nullish(),
  isAssigned: z.boolean().nullish(),
  questionCount: z.number().nullish(),
});

export interface AvailableActivity {
  id: string;
  title: string;
  description: string;
  iconUrl: string | null;
  type: ActivityType | null;
  categoryName: string | null;
  isAssigned: boolean;
  questionCount: number | null;
}

function trimOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

/** `GET …/available-activities?type=test|game` */
export async function fetchAvailableActivities(
  childId: string,
  type: ActivityType,
): Promise<AvailableActivity[]> {
  const { data } = await httpClient.get<unknown>(TRAINING_PLAN_PATHS.available(childId), {
    params: { type },
  });
  return z
    .array(availableActivitySchema)
    .parse(data)
    .map((dto) => ({
      id: dto.id,
      title: dto.title ?? '',
      description: dto.description ?? '',
      iconUrl: dto.iconUrl ?? null,
      type: normalizeActivityType(dto.type),
      categoryName: trimOrNull(dto.categoryName),
      isAssigned: dto.isAssigned ?? false,
      questionCount: dto.questionCount ?? null,
    }));
}

/** `POST …/activities` `{ activityId }` (Swagger `AssignActivityToChildRequest`). */
export async function assignActivity(childId: string, activityId: string): Promise<void> {
  await httpClient.post(TRAINING_PLAN_PATHS.activities(childId), { activityId });
}

/** `DELETE …/activities/{activityId}` — the catalogue activity id (Apidog example). */
export async function removeActivity(childId: string, activityId: string): Promise<void> {
  await httpClient.delete(TRAINING_PLAN_PATHS.activity(childId, activityId));
}

/** `GET specialist/teachers` — VERIFIED LIVE (2026-10-06): `[{ id, fullName }]`. */
const teacherSchema = z.looseObject({ id: z.string(), fullName: z.string().nullish() });

export interface TeacherOption {
  id: string;
  name: string;
}

export async function fetchTeachers(): Promise<TeacherOption[]> {
  const { data } = await httpClient.get<unknown>('specialist/teachers');
  return z
    .array(teacherSchema)
    .parse(data)
    .map((teacher) => ({ id: teacher.id, name: teacher.fullName?.trim() ?? '' }));
}

/** `POST specialist/assign-teacher { teacherId, childIds }` (Swagger). Response not verified (write). */
export async function assignTeacher(teacherId: string, childIds: readonly string[]): Promise<void> {
  await httpClient.post('specialist/assign-teacher', { teacherId, childIds });
}
