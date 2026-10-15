import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import {
  toChoiceQuestionType,
  type ChoiceAnswer,
  type ChoiceQuestionType,
} from '@/components/players';
import {
  mapPlanActivity,
  planActivityDtoSchema,
  type PlanActivity,
} from '@/services/api/childPlan';
import { queryKeys } from '@/services/api/queryKeys';
import { httpClient } from '@/services/http/httpClient';

/**
 * `GET TrainingPlan/children/{childId}/activities/{activityId}` — verified live: questions are
 * `{ planQuestionId, questionId, questionText, questionImageUrl, type, order, options: [{ id,
 * optionText, optionImageUrl, order, correctOrder: null }] }`. Questions have NO `id` (answers use
 * `questionId`) and correct answers are hidden. A missing activity is a 404 `{ message }`
 * (re-verified 2026-10-15), surfaced as a normal `AppError`.
 */
const optionSchema = z.looseObject({
  id: z.string(),
  optionText: z.string().nullish(),
  optionImageUrl: z.string().nullish(),
});

const questionSchema = z.looseObject({
  questionId: z.string(),
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
}

export interface PlanQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  /** null for unknown types — shown as not playable. */
  type: ChoiceQuestionType | null;
  options: readonly PlanQuestionOption[];
}

export interface PlanActivityDetail {
  activity: PlanActivity;
  questions: readonly PlanQuestion[];
}

export function parsePlanActivityDetail(data: unknown): PlanActivityDetail {
  const parsed = detailSchema.parse(data);
  return {
    activity: mapPlanActivity(parsed),
    questions: (parsed.questions ?? []).map((question) => ({
      id: question.questionId,
      text: question.questionText ?? '',
      imageUrl: question.questionImageUrl ?? null,
      type: toChoiceQuestionType(question.type),
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

/** One answer per question (`ActivityAnswerRequest`), see `ChoiceAnswer`. */
export type PlanAnswer = ChoiceAnswer;

/**
 * `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit` `{ answers }` — verified
 * live 2026-10-14 (Parent only): 200 `{ message }`; the plan then shows `score` (rounded % correct),
 * `correctAnswers`, `wrongAnswers`, `isCompleted`, `completedAt`. Every question must be answered
 * (400 "All activity questions must be answered."), empty answers → 400, and there is ONE attempt
 * (second submit → 409 "تم إرسال نتيجة هذا النشاط مسبقًا.").
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
