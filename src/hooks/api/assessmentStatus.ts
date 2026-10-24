import type { AssessmentResult } from '@/services/api/assessmentResult';
import type { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import { useAssessmentResult } from './childResources';

/**
 * Whether the child completed the initial assessment, from the REAL result endpoint
 * (`GET initial-assessment/{childId}/result`): 200 → complete (with the saved result), the
 * documented 404 → incomplete, 403 → unavailable for this account (live 2026-10-24: the Parent gets
 * 403, so the app cannot know — BACKEND_REQUESTS). Nothing is stored or guessed on the device.
 */
export type AssessmentStatus =
  | { state: 'loading' }
  | { state: 'complete'; result: AssessmentResult }
  | { state: 'incomplete' }
  | { state: 'unavailable' }
  | { state: 'error'; error: AppError; retry: () => void };

export function useAssessmentStatus(childId: string | undefined): AssessmentStatus {
  const query = useAssessmentResult(childId);
  if (query.isPending) return { state: 'loading' };
  if (query.isError) {
    if (query.error.status === HTTP_STATUS.FORBIDDEN) return { state: 'unavailable' };
    return { state: 'error', error: query.error, retry: () => void query.refetch() };
  }
  return query.data ? { state: 'complete', result: query.data } : { state: 'incomplete' };
}
