import { useMutation } from '@tanstack/react-query';

import { completeAssessment, startAssessment, submitAnswer } from './assessmentApi';

/* Each call changes server state, so they are mutations (never fired on page load). */

export function useStartAssessment() {
  return useMutation({ mutationFn: startAssessment });
}

export function useSubmitAnswer() {
  return useMutation({ mutationFn: submitAnswer });
}

export function useCompleteAssessment() {
  return useMutation({ mutationFn: completeAssessment });
}
