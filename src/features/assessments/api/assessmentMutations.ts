import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import { completeAssessment, startAssessment, submitAnswer } from './assessmentApi';

/* Each call changes server state, so they are mutations (never fired on page load). */

export function useStartAssessment() {
  return useMutation({ mutationFn: startAssessment });
}

export function useSubmitAnswer() {
  return useMutation({ mutationFn: submitAnswer });
}

export function useCompleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeAssessment,
    // The saved result is now readable with GET initial-assessment/{childId}/result.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.assessments.all }),
  });
}
