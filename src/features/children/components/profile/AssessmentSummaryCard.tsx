import { ClipboardCheck } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';
import { useAssessmentResult } from '@/hooks/api/childResources';

import styles from './profile.module.css';
import { StartAssessmentLink } from './StartAssessmentLink';
import { QueryStatus } from './TabStatus';

const HEADING_ID = 'profile-assessment-title';

export interface AssessmentSummaryCardProps {
  childId: string;
  childName: string;
  /** Only the parent starts the initial assessment (for their child). */
  canStart: boolean;
}

/** Initial assessment: the saved overall result, or an invitation to start it. */
export function AssessmentSummaryCard({
  childId,
  childName,
  canStart,
}: AssessmentSummaryCardProps) {
  const query = useAssessmentResult(childId);
  let body;
  if (query.isPending || query.isError) {
    body = <QueryStatus query={query} errorTitle="تعذّر تحميل نتيجة التقييم" />;
  } else if (query.data) {
    body = (
      <ProgressBar
        label="النتيجة العامة للتقييم المبدئي"
        value={query.data.overallScore}
        max={100}
        showLabel
      />
    );
  } else {
    body = (
      <>
        <p className={styles.muted}>
          يتكوّن التقييم المبدئي من أنشطة وألعاب قصيرة مناسبة لعمر الطفل.
        </p>
        {canStart ? (
          <div className={styles.footer}>
            <StartAssessmentLink childId={childId} childName={childName} />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="التقييم المبدئي"
        icon={ClipboardCheck}
        iconTone="primary"
      />
      {body}
    </Card>
  );
}
