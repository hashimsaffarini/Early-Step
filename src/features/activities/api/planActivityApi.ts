import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — verified live: questions are
 * `{ planQuestionId, questionId, questionText, questionImageUrl, type, order, options: [{ id,
 * optionText, optionImageUrl, order, correctOrder: null }] }`. Questions have NO `id` and answers
 * are hidden. A missing activity is a 200 `{ message }`.
 */
const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
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

/** Question types the backend accepts (`QuestionType`; Matching was removed). */
export const PLAN_QUESTION_TYPES = ['SingleChoice', 'MultiSelect', 'Sequence'] as const;
export type PlanQuestionType = (typeof PLAN_QUESTION_TYPES)[number];

export interface PlanQuestionOption {
  id: string;
  text: string;
  imageUrl: string | null;
}

export interface PlanQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  /** null for unknown types — shown as not playable. */
  type: PlanQuestionType | null;
  options: readonly PlanQuestionOption[];
}

export interface PlanActivityDetail {
  activity: PlanActivity;
  questions: readonly PlanQuestion[];
}

const NOT_IN_PLAN = 'النشاط غير موجود في الخطة التدريبية.';

function normalizeType(value: string | null | undefined): PlanQuestionType | null {
  return PLAN_QUESTION_TYPES.find((type) => type.toLowerCase() === value?.toLowerCase()) ?? null;
}

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
      type: normalizeType(question.type),
      options: (question.options ?? []).map((option) => ({
        id: option.id,
        text: option.optionText ?? '',
        imageUrl: option.optionImageUrl ?? null,
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

/**
 * One answer per question (`ActivityAnswerRequest`): `selectedOptionId` (SingleChoice),
 * `selectedOptionIds` (MultiSelect), `orderedOptionIds` (Sequence, in the child's order).
 */
export type PlanAnswer =
  | { questionId: string; selectedOptionId: string }
  | { questionId: string; selectedOptionIds: string[] }
  | { questionId: string; orderedOptionIds: string[] };

/**
 * `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit` `{ answers }` — verified
 * live 2026-10-10 (Parent): 200 `{ message }`; the plan then shows `correctAnswers`, `wrongAnswers`,
 * `isCompleted`, `completedAt` (unanswered questions are not counted). ONE attempt: a second
 * submit returns an empty 500.
 */
export async function submitPlanActivity(
  childId: string,
  planActivityId: string,
  answers: readonly PlanAnswer[],
): Promise<void> {
  await httpClient.post(
    `TrainingPlan/children/${encodeURIComponent(childId)}/activities/${encodeURIComponent(planActivityId)}/submit`,
    { answers },
  );
}

export function useSubmitPlanActivity(childId: string, planActivityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: readonly PlanAnswer[]) =>
      submitPlanActivity(childId, planActivityId, answers),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.trainingPlans.all }),
  });
}
