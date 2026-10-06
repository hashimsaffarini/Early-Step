import { ClipboardCheck } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';

import { ASSESSMENT_RESULTS_UNAVAILABLE } from './assessmentCopy';
import styles from './profile.module.css';
import { StartAssessmentLink } from './StartAssessmentLink';

const HEADING_ID = 'profile-assessment-title';

export interface AssessmentSummaryCardProps {
  childId: string;
  childName: string;
  /** Only the parent starts the initial assessment (for their child). */
  canStart: boolean;
}

/**
 * Initial assessment. No endpoint returns a child's assessment status or results
 * (BLOCKED BY BACKEND), so the card never claims a state — it only offers to start one.
 */
export function AssessmentSummaryCard({
  childId,
  childName,
  canStart,
}: AssessmentSummaryCardProps) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="التقييم المبدئي"
        icon={ClipboardCheck}
        iconTone="primary"
      />
      <p className={styles.muted}>
        يتكوّن التقييم المبدئي من أنشطة وألعاب قصيرة مناسبة لعمر الطفل.
      </p>
      <p className={styles.muted}>{ASSESSMENT_RESULTS_UNAVAILABLE}</p>
      {canStart ? (
        <div className={styles.footer}>
          <StartAssessmentLink childId={childId} childName={childName} />
        </div>
      ) : null}
    </Card>
  );
}
