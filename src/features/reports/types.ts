export type ReportType = 'follow-up' | 'initial-assessment';

/** A specialist report as shown in the UI prototype (neutral observations only). */
export interface ChildReport {
  id: string;
  childId: string;
  childName: string;
  type: ReportType;
  title: string;
  /** ISO date `YYYY-MM-DD`. */
  date: string;
  authorName: string;
  summary: string;
  strengths: readonly string[];
  areasToSupport: readonly string[];
  recommendations: readonly string[];
}

export interface ReportChildOption {
  id: string;
  name: string;
}
