import { z } from 'zod';

import { isAppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import { HTTP_STATUS } from '@/services/http/httpStatus';

/**
 * Initial-assessment result (shared by the assessment flow and the child profile). Verified live
 * 2026-10-10: `POST initial-assessment/{assessmentId}/complete` and
 * `GET initial-assessment/{childId}/result` return the same object —
 * `{ childId, childName, parentId, parentName, overallScore, categories: [{ categoryName, percentage }] }`
 * (no completion date, no assessment id). The GET is readable by Parent, Specialist, Admin and
 * Super Admin; before completion it answers 404 (plain text).
 */
export const assessmentResultSchema = z.looseObject({
  childId: z.string().nullish(),
  overallScore: z.number(),
  categories: z
    .array(z.looseObject({ categoryName: z.string().nullish(), percentage: z.number() }))
    .nullish(),
});

export interface AssessmentResult {
  overallScore: number;
  categories: { name: string; percentage: number }[];
}

export function mapAssessmentResult(dto: z.infer<typeof assessmentResultSchema>): AssessmentResult {
  return {
    overallScore: dto.overallScore,
    categories: (dto.categories ?? []).map((category) => ({
      name: category.categoryName?.trim() ?? '',
      percentage: category.percentage,
    })),
  };
}

/** `GET initial-assessment/{childId}/result` — null while the child has no completed assessment. */
export async function fetchAssessmentResult(childId: string): Promise<AssessmentResult | null> {
  try {
    const { data } = await httpClient.get<unknown>(
      `initial-assessment/${encodeURIComponent(childId)}/result`,
    );
    return mapAssessmentResult(assessmentResultSchema.parse(data));
  } catch (error) {
    if (isAppError(error) && error.status === HTTP_STATUS.NOT_FOUND) return null;
    throw error;
  }
}
