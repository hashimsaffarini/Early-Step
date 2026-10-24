import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ActivityType } from '@/services/api/activityType';
import { queryKeys } from '@/services/api/queryKeys';

import {
  addCategoryToAssessment,
  addQuestionsToAssessment,
  createActivity,
  createCategory,
  createQuestion,
  deleteActivity,
  deleteAllOptions,
  deleteCategory,
  deleteOption,
  deleteQuestion,
  fetchActivities,
  fetchActivity,
  fetchCategories,
  removeCategoryFromAssessment,
  removeQuestionFromAssessment,
  updateActivity,
  updateCategory,
  updateOption,
  updateQuestionInfo,
  type ActivityInput,
  type OptionUpdateInput,
  type QuestionInfoInput,
  type QuestionInput,
  fetchAssessmentCategoryIds,
  fetchCategoryQuestions,
} from './contentApi';
import { planCorrectAnswerUpdates, type CorrectAnswerChoice } from './correctAnswers';
import type { Question } from '../types';

export function useCategories() {
  return useQuery({ queryKey: queryKeys.content.categories(), queryFn: fetchCategories });
}

/** Ids of the categories in the initial assessment (authoritative membership). */
export function useAssessmentCategoryIds() {
  return useQuery({
    queryKey: queryKeys.content.initialAssessmentCategories(),
    queryFn: fetchAssessmentCategoryIds,
  });
}

/** Questions of a category, grouped by activity (see `fetchCategoryQuestions`). */
export function useCategoryQuestions(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.content.categoryQuestions(categoryId),
    queryFn: () => fetchCategoryQuestions(categoryId),
  });
}

export function useActivities(type: ActivityType, categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.content.activities(type, categoryId),
    queryFn: () => fetchActivities(type, categoryId),
  });
}

export interface CategoryActivityCount {
  tests: number;
  games: number;
}

/**
 * Activities per category, counted from the REAL activity lists (`GET Admin/activities/test` and
 * `/game`, client revision 2026-10). The server's `count` on `Admin/categories` showed 0 for
 * categories that have activities, so it is not used. Shares the lists' cache, so every content
 * mutation (which refreshes the `content` cache) updates the counts.
 */
export function useCategoryActivityCounts() {
  const tests = useActivities('test');
  const games = useActivities('game');
  const counts = new Map<string, CategoryActivityCount>();
  const add = (categoryId: string | null, key: keyof CategoryActivityCount) => {
    if (!categoryId) return;
    const current = counts.get(categoryId) ?? { tests: 0, games: 0 };
    counts.set(categoryId, { ...current, [key]: current[key] + 1 });
  };
  for (const activity of tests.data ?? []) add(activity.categoryId, 'tests');
  for (const activity of games.data ?? []) add(activity.categoryId, 'games');
  return {
    counts,
    isPending: tests.isPending || games.isPending,
    error: tests.error ?? games.error,
    refetch: () => {
      void tests.refetch();
      void games.refetch();
    },
  };
}

export function useActivity(type: ActivityType | null, activityId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.content.activity(type ?? '', activityId ?? ''),
    queryFn: () => fetchActivity(type ?? 'test', activityId ?? ''),
    enabled: type !== null && Boolean(activityId),
  });
}

/**
 * Content data is interlinked (category counts, question counts, assessment membership), so every
 * content mutation refreshes the whole `content` cache — small lists, always consistent.
 */
function useContentMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<void>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.content.all }),
  });
}

export const useCreateCategory = () => useContentMutation((name: string) => createCategory(name));
export const useUpdateCategory = () =>
  useContentMutation(({ id, name }: { id: string; name: string }) => updateCategory(id, name));
export const useDeleteCategory = () => useContentMutation((id: string) => deleteCategory(id));

export const useSaveActivity = () =>
  useContentMutation(
    ({ type, id, input }: { type: ActivityType; id: string | null; input: ActivityInput }) =>
      id ? updateActivity(type, id, input) : createActivity(type, input),
  );
export const useDeleteActivity = () =>
  useContentMutation(({ type, id }: { type: ActivityType; id: string }) =>
    deleteActivity(type, id),
  );

export const useCreateQuestion = () =>
  useContentMutation(({ activityId, input }: { activityId: string; input: QuestionInput }) =>
    createQuestion(activityId, input),
  );
export const useUpdateQuestionInfo = () =>
  useContentMutation(({ id, input }: { id: string; input: QuestionInfoInput }) =>
    updateQuestionInfo(id, input),
  );
export const useDeleteQuestion = () => useContentMutation((id: string) => deleteQuestion(id));
export const useUpdateOption = () =>
  useContentMutation(({ id, input }: { id: string; input: OptionUpdateInput }) =>
    updateOption(id, input),
  );
export const useDeleteOption = () => useContentMutation((id: string) => deleteOption(id));
export const useDeleteAllOptions = () => useContentMutation((id: string) => deleteAllOptions(id));

export const useToggleAssessmentCategory = () =>
  useContentMutation(({ id, include }: { id: string; include: boolean }) =>
    include ? addCategoryToAssessment(id) : removeCategoryFromAssessment(id),
  );
export const useToggleAssessmentQuestion = () =>
  useContentMutation(({ id, include }: { id: string; include: boolean }) =>
    include ? addQuestionsToAssessment([id]) : removeQuestionFromAssessment(id),
  );

/**
 * Saves the correct answers of one question: the planned option updates run one after another
 * (the backend needs the old SingleChoice answer cleared first). The content cache is refreshed
 * afterwards even when a step fails, so the list always shows what the server stored.
 */
export function useSaveCorrectAnswers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      question,
      choice,
    }: {
      question: Question;
      choice: CorrectAnswerChoice;
    }) => {
      for (const step of planCorrectAnswerUpdates(question, choice)) {
        await updateOption(step.optionId, step.input);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.content.all }),
  });
}
