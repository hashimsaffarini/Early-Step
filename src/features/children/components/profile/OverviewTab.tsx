import type { ChildProfileDetails } from '@/features/children/types';

import { AssessmentSummaryCard } from './AssessmentSummaryCard';
import { PlanSummaryCard } from './PlanSummaryCard';
import styles from './profile.module.css';
import { ProfileSummaryTiles } from './ProfileSummaryTiles';
import { RecentEventsCard } from './RecentEventsCard';
import { ReportsSummaryCard } from './ReportsSummaryCard';

export interface OverviewTabProps {
  details: ChildProfileDetails;
  onShowActivities: () => void;
  onShowReports: () => void;
}

export function OverviewTab({ details, onShowActivities, onShowReports }: OverviewTabProps) {
  return (
    <div className={styles.twoColumns}>
      <AssessmentSummaryCard assessment={details.assessments[0]} />
      <ProfileSummaryTiles details={details} />
      <PlanSummaryCard plan={details.plan} onShowActivities={onShowActivities} />
      <ReportsSummaryCard reports={details.reports} onShowReports={onShowReports} />
      <div className={styles.fullSpan}>
        <RecentEventsCard events={details.events} />
      </div>
    </div>
  );
}
