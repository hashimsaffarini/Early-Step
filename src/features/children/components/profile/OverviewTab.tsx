import { AssessmentSummaryCard } from './AssessmentSummaryCard';
import { PlanSummaryCard } from './PlanSummaryCard';
import styles from './profile.module.css';
import { ReportsSummaryCard } from './ReportsSummaryCard';

export interface OverviewTabProps {
  childId: string;
  childName: string;
  canStartAssessment: boolean;
  canReadAssessmentResult: boolean;
  onShowActivities: () => void;
  onShowReports: () => void;
}

/**
 * Overview: one full-width column under the child header — assessment, training plan, report
 * (client revision 2026-10: sections on the same level, no side-by-side nested cards). Server data
 * only; Replit's "recent activity" feed has no endpoint and is not shown.
 */
export function OverviewTab({
  childId,
  childName,
  canStartAssessment,
  canReadAssessmentResult,
  onShowActivities,
  onShowReports,
}: OverviewTabProps) {
  return (
    <div className={styles.stack}>
      <AssessmentSummaryCard
        childId={childId}
        childName={childName}
        canStart={canStartAssessment}
        canReadResult={canReadAssessmentResult}
      />
      <PlanSummaryCard childId={childId} onShowActivities={onShowActivities} />
      <ReportsSummaryCard childId={childId} onShowReports={onShowReports} />
    </div>
  );
}
