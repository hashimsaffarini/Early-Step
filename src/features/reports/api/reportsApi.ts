import {
  fetchChildReports,
  mapReport,
  reportListSchema,
  type ChildReport,
} from '@/services/api/childReports';
import { toFormData } from '@/services/http/formData';
import { httpClient } from '@/services/http/httpClient';

/** Paths relative to `VITE_API_BASE_URL` (Swagger: `/api/specialist/*`, `/api/Reports/*`). */
export const REPORT_PATHS = {
  specialistList: 'specialist/Reports',
  create: 'specialist/CreateReport',
  byId: (reportId: string) => `specialist/${encodeURIComponent(reportId)}`,
  download: (reportId: string) => `Reports/${encodeURIComponent(reportId)}/download`,
} as const;

export { fetchChildReports };

/** `GET specialist/Reports` — the specialist's reports. Item shape NOT LIVE-VERIFIED. */
export async function fetchSpecialistReports(): Promise<ChildReport[]> {
  const { data } = await httpClient.get<unknown>(REPORT_PATHS.specialistList);
  return reportListSchema.parse(data).map(mapReport);
}

export interface ReportInput {
  title: string;
  weaknesses: string;
  recommendations: string;
}

/** `POST specialist/CreateReport` (JSON, Swagger `CreateReportRequest`). */
export async function createReport(input: ReportInput & { childId: string }): Promise<void> {
  await httpClient.post(REPORT_PATHS.create, {
    childId: input.childId,
    title: input.title,
    weaknesses: input.weaknesses,
    recommendations: input.recommendations,
  });
}

/** `PUT specialist/{reportId}` (`multipart/form-data`: `Title`, `Weaknesses`, `Recommendations`). */
export async function updateReport(reportId: string, input: ReportInput): Promise<void> {
  await httpClient.put(
    REPORT_PATHS.byId(reportId),
    toFormData({
      Title: input.title,
      Weaknesses: input.weaknesses,
      Recommendations: input.recommendations,
    }),
  );
}

/** `DELETE specialist/{reportId}` */
export async function deleteReport(reportId: string): Promise<void> {
  await httpClient.delete(REPORT_PATHS.byId(reportId));
}

export interface DownloadedFile {
  blob: Blob;
  filename: string;
}

const FILENAME_PATTERN = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;

/** Reads the filename from `Content-Disposition` (RFC 5987 `filename*` or plain `filename`). */
export function filenameFromDisposition(header: unknown, fallback: string): string {
  if (typeof header !== 'string') return fallback;
  const match = FILENAME_PATTERN.exec(header);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].trim());
  } catch {
    return match[1].trim();
  }
}

/** `GET Reports/{reportId}/download` — server-generated PDF (binary). */
export async function downloadReportPdf(reportId: string): Promise<DownloadedFile> {
  const response = await httpClient.get<Blob>(REPORT_PATHS.download(reportId), {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  });
  return {
    blob: response.data,
    filename: filenameFromDisposition(
      response.headers['content-disposition'],
      `report-${reportId}.pdf`,
    ),
  };
}
