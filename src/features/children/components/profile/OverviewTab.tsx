import { Plus } from 'lucide-react';

import type { ChildProfileDetails } from '@/features/children/types';

import { AssessmentSummaryCard } from './AssessmentSummaryCard';
import { ASSIGN_ACTIVITY_LABEL } from './labels';
import { PlanSummaryCard } from './PlanSummaryCard';
import styles from './profile.module.css';
import { ProfileSummaryTiles } from './ProfileSummaryTiles';
import { RecentEventsCard } from './RecentEventsCard';
import { ReportsSummaryCard } from './ReportsSummaryCard';

export interface OverviewTabProps {
  childId: string;
  childName: string;
  details: ChildProfileDetails;
  onShowActivities: () => void;
  onShowReports: () => void;
  /** Staff only: opens the assign-activity dialog (Replit gradient CTA). */
  onAssign?: (() => void) | undefined;
}

export function OverviewTab({
  childId,
  childName,
  details,
  onShowActivities,
  onShowReports,
  onAssign,
}: OverviewTabProps) {
  return (
    <div className={styles.twoColumns}>
      <AssessmentSummaryCard
        assessment={details.assessments[0]}
        childId={childId}
        childName={childName}
      />
      <div className={styles.column}>
        <ProfileSummaryTiles details={details} />
        {onAssign ? (
          <button type="button" className={styles.assignCta} onClick={onAssign}>
            <Plus aria-hidden="true" />
            {ASSIGN_ACTIVITY_LABEL}
          </button>
        ) : null}
      </div>
      <PlanSummaryCard plan={details.plan} onShowActivities={onShowActivities} />
      <ReportsSummaryCard reports={details.reports} onShowReports={onShowReports} />
      <div className={styles.fullSpan}>
        <RecentEventsCard events={details.events} />
      </div>
    </div>
  );
}
