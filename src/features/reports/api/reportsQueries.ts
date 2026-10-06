import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import type { AreaRole } from '@/constants/routes';
import { useChildrenForRole } from '@/hooks/api/childResources';
import type { ChildReport } from '@/services/api/childReports';
import { queryKeys } from '@/services/api/queryKeys';
import type { AppError } from '@/services/http/apiError';

import {
  createReport,
  deleteReport,
  downloadReportPdf,
  fetchChildReports,
  fetchSpecialistReports,
  updateReport,
  type ReportInput,
} from './reportsApi';

/** A report as listed in the UI: the child's name is always known. */
export interface ReportView extends ChildReport {
  childId: string | null;
  childName: string;
}

export interface RoleReports {
  /** False for roles with no reports endpoint (Admin — BLOCKED BY BACKEND). */
  isSupported: boolean;
  reports: ReportView[];
  isPending: boolean;
  error: AppError | null;
  refetch: () => void;
}

function newestFirst(a: ReportView, b: ReportView): number {
  return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
}

/**
 * Reports visible to a role:
 * - Specialist: `GET specialist/Reports`.
 * - Parent / Teacher: `GET Reports/child/{id}` for each of their children, merged.
 * - Admin: no endpoint (BLOCKED BY BACKEND).
 */
export function useRoleReports(role: AreaRole): RoleReports {
  const isSpecialist = role === 'Specialist';
  const usesChildren = role === 'Parent' || role === 'Teacher';

  const specialist = useQuery({
    queryKey: queryKeys.reports.specialist(),
    queryFn: fetchSpecialistReports,
    enabled: isSpecialist,
  });

  const childrenQuery = useChildrenForRole(role);
  const children = usesChildren ? (childrenQuery.data ?? []) : [];
  const perChild = useQueries({
    queries: children.map((child) => ({
      queryKey: queryKeys.reports.byChild(child.id),
      queryFn: () => fetchChildReports(child.id),
    })),
  });

  if (isSpecialist) {
    return {
      isSupported: true,
      reports: (specialist.data ?? [])
        .map((report) => ({ ...report, childName: report.childName ?? '' }))
        .sort(newestFirst),
      isPending: specialist.isPending,
      error: specialist.error,
      refetch: () => {
        void specialist.refetch();
      },
    };
  }

  if (!usesChildren) {
    return {
      isSupported: false,
      reports: [],
      isPending: false,
      error: null,
      refetch: () => undefined,
    };
  }

  const reports = perChild
    .flatMap((query, index) => {
      const child = children[index];
      return (query.data ?? []).map((report) => ({
        ...report,
        childId: report.childId ?? child?.id ?? null,
        childName: report.childName ?? child?.fullName ?? '',
      }));
    })
    .sort(newestFirst);

  return {
    isSupported: true,
    reports,
    isPending: childrenQuery.isPending || perChild.some((query) => query.isPending),
    error: childrenQuery.error ?? perChild.find((query) => query.error)?.error ?? null,
    refetch: () => {
      void childrenQuery.refetch();
      for (const query of perChild) void query.refetch();
    },
  };
}

function useInvalidateReports() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
}

export function useCreateReportMutation() {
  const invalidate = useInvalidateReports();
  return useMutation({ mutationFn: createReport, onSuccess: invalidate });
}

export function useUpdateReportMutation(reportId: string) {
  const invalidate = useInvalidateReports();
  return useMutation({
    mutationFn: (input: ReportInput) => updateReport(reportId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteReportMutation() {
  const invalidate = useInvalidateReports();
  return useMutation({ mutationFn: deleteReport, onSuccess: invalidate });
}

/** Downloads the server PDF and hands it to the browser as a file. */
export function useDownloadReportMutation() {
  return useMutation({
    mutationFn: downloadReportPdf,
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
  });
}
