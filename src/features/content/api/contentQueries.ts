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
  fetchCategoriesWithCounts,
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
} from './contentApi';

export function useCategories() {
  return useQuery({ queryKey: queryKeys.content.categories(), queryFn: fetchCategories });
}

export function useCategoriesWithCounts(type: ActivityType) {
  return useQuery({
    queryKey: queryKeys.content.categoriesWithCounts(type),
    queryFn: () => fetchCategoriesWithCounts(type),
  });
}

/** Ids of the categories in the initial assessment (authoritative membership). */
export function useAssessmentCategoryIds() {
  return useQuery({
    queryKey: queryKeys.content.initialAssessmentCategories(),
    queryFn: fetchAssessmentCategoryIds,
  });
}

export function useActivities(type: ActivityType, categoryId?: string) {
  return useQuery({
    queryKey: queryKeys.content.activities(type, categoryId),
    queryFn: () => fetchActivities(type, categoryId),
  });
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
