import { AssessmentSummaryCard } from './AssessmentSummaryCard';
import { PlanSummaryCard } from './PlanSummaryCard';
import styles from './profile.module.css';
import { ProfileSummaryTiles } from './ProfileSummaryTiles';
import { ReportsSummaryCard } from './ReportsSummaryCard';

export interface OverviewTabProps {
  childId: string;
  childName: string;
  canStartAssessment: boolean;
  onShowActivities: () => void;
  onShowReports: () => void;
}

/** Overview: server data only. (Replit's "recent activity" feed has no endpoint — not shown.) */
export function OverviewTab({
  childId,
  childName,
  canStartAssessment,
  onShowActivities,
  onShowReports,
}: OverviewTabProps) {
  return (
    <div className={styles.twoColumns}>
      <AssessmentSummaryCard
        childId={childId}
        childName={childName}
        canStart={canStartAssessment}
      />
      <ProfileSummaryTiles childId={childId} />
      <PlanSummaryCard childId={childId} onShowActivities={onShowActivities} />
      <ReportsSummaryCard childId={childId} onShowReports={onShowReports} />
    </div>
  );
}
