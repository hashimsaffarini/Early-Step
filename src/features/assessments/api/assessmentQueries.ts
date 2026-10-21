import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/services/api/queryKeys';

import { fetchAssessmentCategories } from './assessmentApi';

/** The categories the initial assessment is made of — a read, safe to load with the page. */
export function useAssessmentCategories() {
  return useQuery({
    queryKey: queryKeys.assessments.categories(),
    queryFn: fetchAssessmentCategories,
  });
}
