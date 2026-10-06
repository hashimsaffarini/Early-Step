import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

import { normalizeActivityType, type ActivityType } from './activityType';

/**
 * Training-plan activities of a child (shared by children, activities, training-plans).
 * Shape from the Apidog example of the add-activity response; NOT LIVE-VERIFIED.
 */
export const planActivityDtoSchema = z.looseObject({
  id: z.string(),
  activityId: z.string(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  iconUrl: z.string().nullish(),
  type: z.string().nullish(),
  order: z.number().nullish(),
  assignedAt: z.string().nullish(),
  score: z.number().nullish(),
  correctAnswers: z.number().nullish(),
  wrongAnswers: z.number().nullish(),
  isCompleted: z.boolean().nullish(),
  completedAt: z.string().nullish(),
});

export interface PlanActivity {
  id: string;
  activityId: string;
  title: string;
  description: string;
  iconUrl: string | null;
  type: ActivityType | null;
  order: number | null;
  assignedAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  correctAnswers: number | null;
  wrongAnswers: number | null;
}

export function mapPlanActivity(dto: z.infer<typeof planActivityDtoSchema>): PlanActivity {
  return {
    id: dto.id,
    activityId: dto.activityId,
    title: dto.title ?? '',
    description: dto.description ?? '',
    iconUrl: dto.iconUrl ?? null,
    type: normalizeActivityType(dto.type),
    order: dto.order ?? null,
    assignedAt: dto.assignedAt ?? null,
    isCompleted: dto.isCompleted ?? false,
    completedAt: dto.completedAt ?? null,
    correctAnswers: dto.correctAnswers ?? null,
    wrongAnswers: dto.wrongAnswers ?? null,
  };
}

const summarySchema = z.looseObject({
  gamesCount: z.number(),
  testsCount: z.number(),
  totalCount: z.number(),
});

export type PlanSummary = z.infer<typeof summarySchema>;

/** `GET TrainingPlan/children/{childId}/activities[?type=]` */
export async function fetchChildPlanActivities(
  childId: string,
  type?: ActivityType,
): Promise<PlanActivity[]> {
  const { data } = await httpClient.get<unknown>(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities`,
    { params: type ? { type } : undefined },
  );
  return z.array(planActivityDtoSchema).parse(data).map(mapPlanActivity);
}

/** `GET TrainingPlan/children/{childId}/activities/summary` → `{ gamesCount, testsCount, totalCount }` */
export async function fetchChildPlanSummary(childId: string): Promise<PlanSummary> {
  const { data } = await httpClient.get<unknown>(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities/summary`,
  );
  return summarySchema.parse(data);
}
