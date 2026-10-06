import { z } from 'zod';

import { httpClient } from '@/services/http/httpClient';

/**
 * Child report (shared by children, reports and dashboards).
 * Fields from the Swagger request (`title`, `weaknesses`, `recommendations`); the response
 * shape is undocumented — ids/dates/author are read leniently. NOT LIVE-VERIFIED.
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

/** `GET Reports/child/{childId}` */
export async function fetchChildReports(childId: string): Promise<ChildReport[]> {
  const { data } = await httpClient.get<unknown>(`Reports/child/${encodeURIComponent(childId)}`);
  return reportListSchema.parse(data).map(mapReport);
}
