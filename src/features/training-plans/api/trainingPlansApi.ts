import { z } from 'zod';

import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';
import {
  mapPlanActivity,
  planActivityDtoSchema,
  type PlanActivity,
} from '@/services/api/childPlan';
import { httpClient } from '@/services/http/httpClient';

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
  /** False when the backend answers "لا توجد خطة تدريبية لهذا الطفل." (no plan yet). */
  hasPlan: boolean;
  activities: PlanActivity[];
}

const activityList = z.array(planActivityDtoSchema);
const planObjectSchema = z.looseObject({
  activities: activityList.nullish(),
  trainingPlanActivities: activityList.nullish(),
});

/**
 * `GET TrainingPlan/specialist/children/{childId}`. Response undocumented except the
 * "no plan" message (Apidog). Accepted shapes (NOT LIVE-VERIFIED): an array of plan activities,
 * or an object with an `activities` array; a `{ message }` body means "no plan yet".
 */
export function parseSpecialistPlan(data: unknown): SpecialistPlan {
  const asList = activityList.safeParse(data);
  if (asList.success) return { hasPlan: true, activities: asList.data.map(mapPlanActivity) };
  const asObject = planObjectSchema.safeParse(data);
  const items = asObject.success
    ? (asObject.data.activities ?? asObject.data.trainingPlanActivities ?? null)
    : null;
  if (items) return { hasPlan: true, activities: items.map(mapPlanActivity) };
  return { hasPlan: false, activities: [] };
}

export async function fetchSpecialistPlan(childId: string): Promise<SpecialistPlan> {
  const { data } = await httpClient.get<unknown>(TRAINING_PLAN_PATHS.specialistPlan(childId));
  return parseSpecialistPlan(data);
}

/** Available-activity item (Apidog example shape). */
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
