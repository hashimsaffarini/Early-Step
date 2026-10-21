import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

import { normalizeActivityType, type ActivityType } from './activityType';

/**
 * Training-plan activity (shared by children, activities, training-plans). VERIFIED LIVE
 * (2026-10-06) in three shapes that differ only in the row-id name and in optional fields:
 * - `GET TrainingPlan/children/{id}/activities?type=` → `{ planActivityId, activityId, title, iconUrl, type, isCompleted }`
 * - `GET TrainingPlan/children/{id}/activities/{activityId}` → the above + `description`, `questions`
 * - `GET TrainingPlan/specialist/children/{id}` → `activities[]` with `trainingPlanActivityId`,
 *   `description, order, assignedAt, score, correctAnswers, wrongAnswers, completedAt` (`score` =
 *   rounded % of correct answers once submitted — verified 2026-10-14)
 * `type` is the Arabic label (`اختبارات`); `iconUrl` is server-relative (`/uploads/...`).
 */
export const planActivityDtoSchema = z.looseObject({
  planActivityId: z.string().optional(),
  trainingPlanActivityId: z.string().optional(),
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
  /**
   * The activity's `slug` (saved by the Admin, `POST/PUT Admin/activities/{type}` `Slug`). NOT sent
   * by the live Training Plan endpoints yet (verified 2026-10-15) — requested from the backend;
   * read when present so a game opens its dedicated engine (`components/games`).
   */
  slug: z.string().nullish(),
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
  /** Percentage of correct answers (0–100) once the child submitted the activity. */
  score: number | null;
  correctAnswers: number | null;
  wrongAnswers: number | null;
  /** Game template key (`letter-hunt`, …) when the server sends the activity slug. */
  slug: string | null;
}

export function mapPlanActivity(dto: z.infer<typeof planActivityDtoSchema>): PlanActivity {
  return {
    id: dto.planActivityId ?? dto.trainingPlanActivityId ?? dto.activityId,
    activityId: dto.activityId,
    title: dto.title ?? '',
    description: dto.description ?? '',
    iconUrl: dto.iconUrl ?? null,
    type: normalizeActivityType(dto.type),
    order: dto.order ?? null,
    assignedAt: dto.assignedAt ?? null,
    isCompleted: dto.isCompleted ?? false,
    completedAt: dto.completedAt ?? null,
    score: dto.score ?? null,
    correctAnswers: dto.correctAnswers ?? null,
    wrongAnswers: dto.wrongAnswers ?? null,
    slug: dto.slug ?? null,
  };
}

const summarySchema = z.looseObject({
  gamesCount: z.number(),
  testsCount: z.number(),
  totalCount: z.number(),
});

export type PlanSummary = z.infer<typeof summarySchema>;

/**
 * `GET TrainingPlan/children/{childId}/activities?type=test|game`. VERIFIED LIVE: `type` is
 * **required** (400 without it), so "all activities" = tests + games, fetched in parallel.
 */
export async function fetchChildPlanActivities(
  childId: string,
  type?: ActivityType,
): Promise<PlanActivity[]> {
  const types: readonly ActivityType[] = type ? [type] : ['test', 'game'];
  const lists = await Promise.all(
    types.map(async (activityType) => {
      const { data } = await httpClient.get<unknown>(
        `TrainingPlan/children/${encodeURIComponent(childId)}/activities`,
        { params: { type: activityType } },
      );
      return z.array(planActivityDtoSchema).parse(data).map(mapPlanActivity);
    }),
  );
  return lists.flat();
}

/** `GET TrainingPlan/children/{childId}/activities/summary` → `{ gamesCount, testsCount, totalCount }` (VERIFIED LIVE). */
export async function fetchChildPlanSummary(childId: string): Promise<PlanSummary> {
  const { data } = await httpClient.get<unknown>(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities/summary`,
  );
  return summarySchema.parse(data);
}
