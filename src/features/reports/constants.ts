import type { ReportType } from './types';

export const REPORT_TYPES = [
  'follow-up',
  'initial-assessment',
] as const satisfies readonly ReportType[];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  'follow-up': 'تقرير متابعة',
  'initial-assessment': 'تقرير التقييم المبدئي',
};

/** Short chip labels for the list filter. */
export const REPORT_TYPE_FILTER_LABELS: Record<ReportType, string> = {
  'follow-up': 'متابعة',
  'initial-assessment': 'تقييم مبدئي',
};
