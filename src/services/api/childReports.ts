import { z } from 'zod';

import { AppError } from '@/services/http/apiError';
import { httpClient } from '@/services/http/httpClient';
import { HTTP_STATUS } from '@/services/http/httpStatus';

/**
 * Child report (shared by children, reports and dashboards).
 * Fields from the Swagger request (`title`, `weaknesses`, `recommendations`); the response
 * VERIFIED LIVE item: `{ id, childId, childName, specialistId, specialistName, title, weaknesses,
 * recommendations, createdAt }`.
 * There is no "strengths" field in the API.
 */
const reportDtoSchema = z.looseObject({
  id: z.string(),
  childId: z.string().nullish(),
  childName: z.string().nullish(),
  title: z.string().nullish(),
  weaknesses: z.string().nullish(),
  recommendations: z.string().nullish(),
  createdAt: z.string().nullish(),
  specialistName: z.string().nullish(),
});

export interface ChildReport {
  id: string;
  childId: string | null;
  childName: string | null;
  title: string;
  weaknesses: string;
  recommendations: string;
  createdAt: string | null;
  authorName: string | null;
}

export function mapReport(dto: z.infer<typeof reportDtoSchema>): ChildReport {
  return {
    id: dto.id,
    childId: dto.childId ?? null,
    childName: dto.childName ?? null,
    title: dto.title ?? '',
    weaknesses: dto.weaknesses ?? '',
    recommendations: dto.recommendations ?? '',
    createdAt: dto.createdAt ?? null,
    authorName: dto.specialistName ?? null,
  };
}

export const reportListSchema = z.array(reportDtoSchema);
export { reportDtoSchema };

/** VERIFIED LIVE: a child without reports answers `404 { message: " لا يوجد تقرير ." }`. */
const NO_REPORTS_MESSAGE = 'لا يوجد تقرير';

export function isNoReportsError(error: unknown): boolean {
  return (
    error instanceof AppError &&
    error.status === HTTP_STATUS.NOT_FOUND &&
    error.message.includes(NO_REPORTS_MESSAGE)
  );
}

/** `GET Reports/child/{childId}` — an empty list when the backend says there are no reports. */
export async function fetchChildReports(childId: string): Promise<ChildReport[]> {
  try {
    const { data } = await httpClient.get<unknown>(`Reports/child/${encodeURIComponent(childId)}`);
    // VERIFIED LIVE (2026-10-07): a child with reports returns ONE report object (the first one),
    // not an array — accept both; the backend has been asked to return the full list.
    const list = Array.isArray(data) ? data : [data];
    return reportListSchema.parse(list).map(mapReport);
  } catch (error) {
    if (isNoReportsError(error)) return [];
    throw error;
  }
}
