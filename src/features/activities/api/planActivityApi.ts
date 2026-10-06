import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import {
  mapPlanActivity,
  planActivityDtoSchema,
  type PlanActivity,
} from '@/services/api/childPlan';
import { queryKeys } from '@/services/api/queryKeys';
import { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';
import { httpClient } from '@/services/http/httpClient';

/**
 * `GET TrainingPlan/children/{childId}/activities/{activityId}`.
 * ⚠️ NOT LIVE-VERIFIED: the response is undocumented (Apidog only shows the 200
 * `{ message: "النشاط غير موجود في الخطة التدريبية." }` case). Accepted: the plan-activity fields
 * plus an optional `questions[]` in the admin question model; `isCorrect` is used only if exposed.
 * There is NO endpoint to submit training-plan results (BLOCKED BY BACKEND).
 */
const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
  isCorrect: z.boolean().nullish(),
});

const questionSchema = z.looseObject({
  id: z.string(),
  questionText: z.string().nullish(),
  questionImageUrl: z.string().nullish(),
  type: z.string().nullish(),
  options: z.array(optionSchema).nullish(),
});

const detailSchema = planActivityDtoSchema.extend({
  questions: z.array(questionSchema).nullish(),
});

export interface PlanQuestionOption {
  id: string;
  text: string;
  imageUrl: string | null;
  /** null when the server does not expose correctness. */
  isCorrect: boolean | null;
}

export interface PlanQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  /** Only single-choice questions are playable here. */
  isSingleChoice: boolean;
  options: readonly PlanQuestionOption[];
}

export interface PlanActivityDetail {
  activity: PlanActivity;
  questions: readonly PlanQuestion[];
}

const NOT_IN_PLAN = 'النشاط غير موجود في الخطة التدريبية.';

export function parsePlanActivityDetail(data: unknown): PlanActivityDetail {
  const parsed = detailSchema.safeParse(data);
  if (!parsed.success) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? String(data.message)
        : NOT_IN_PLAN;
    throw new AppError(message, { kind: 'http', status: HTTP_STATUS.NOT_FOUND });
  }
  return {
    activity: mapPlanActivity(parsed.data),
    questions: (parsed.data.questions ?? []).map((question) => ({
      id: question.id,
      text: question.questionText ?? '',
      imageUrl: question.questionImageUrl ?? null,
      isSingleChoice: (question.type ?? '').toLowerCase() === 'singlechoice',
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        text: option.optionText ?? '',
        imageUrl: option.optionImageUrl ?? null,
        isCorrect: option.isCorrect ?? null,
      })),
    })),
  };
}

export async function fetchPlanActivityDetail(
  childId: string,
  activityId: string,
): Promise<PlanActivityDetail> {
  const { data } = await httpClient.get<unknown>(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities/${encodeURIComponent(activityId)}`,
  );
  return parsePlanActivityDetail(data);
}

export function usePlanActivityDetail(childId: string, activityId: string) {
  return useQuery({
    queryKey: queryKeys.trainingPlans.childActivity(childId, activityId),
    queryFn: () => fetchPlanActivityDetail(childId, activityId),
    enabled: Boolean(childId && activityId),
  });
}
