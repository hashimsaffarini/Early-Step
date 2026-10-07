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
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — verified live 2026-10-07:
 * questions are `{ planQuestionId, questionId, questionText, questionImageUrl, type, order,
 * options: [{ id, optionText, optionImageUrl, order, correctOrder: null, pairKey: null }] }`.
 * Questions have NO `id` and answers are hidden (`isCorrect` absent, `correctOrder`/`pairKey`
 * nulled) — `isCorrect` is used only if the server ever exposes it. A missing activity is a 200
 * `{ message }`. There is NO endpoint to submit training-plan results (BLOCKED BY BACKEND).
 */
const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
  isCorrect: z.boolean().nullish(),
});

const questionSchema = z.looseObject({
  questionId: z.string().nullish(),
  planQuestionId: z.string().nullish(),
  id: z.string().nullish(),
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
      id: question.questionId ?? question.id ?? question.planQuestionId ?? '',
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
