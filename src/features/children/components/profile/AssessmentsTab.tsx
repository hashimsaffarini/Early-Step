import { CalendarDays, ClipboardCheck, Layers } from 'lucide-react';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildAssessment } from '@/features/children/types';

import { ASSESSMENT_STATE_DISPLAY } from './labels';
import styles from './profile.module.css';

const HEADING_ID = 'profile-assessments-title';

export function AssessmentsTab({ assessments }: { assessments: readonly ChildAssessment[] }) {
  if (assessments.length === 0) {
    return <EmptyState icon={<ClipboardCheck />} title="لا توجد تقييمات بعد" />;
  }

  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="سجل التقييمات"
        icon={ClipboardCheck}
        iconTone="primary"
      />
      <ul className={styles.list}>
        {assessments.map((assessment) => {
          const state = ASSESSMENT_STATE_DISPLAY[assessment.state];
          return (
            <li key={assessment.id} className={styles.row}>
              <span className={`${styles.iconTile} ${styles.tonePrimary}`} aria-hidden="true">
                <ClipboardCheck />
              </span>
              <div className={styles.rowBody}>
                <p className={styles.rowTitle}>{assessment.title}</p>
                <ul className={styles.meta}>
                  {assessment.completedAt ? (
                    <li>
                      <CalendarDays aria-hidden="true" />
                      {formatDisplayDate(assessment.completedAt)}
                    </li>
                  ) : null}
                  {assessment.totalSections ? (
                    <li>
                      <Layers aria-hidden="true" />
                      {assessment.completedSections ?? 0} من {assessment.totalSections} أقسام
                    </li>
                  ) : null}
                </ul>
              </div>
              <Badge tone={state.tone} hasDot>
                {state.label}
              </Badge>
              {assessment.state === 'not-started' ? (
                <ComingSoonButton>بدء التقييم</ComingSoonButton>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
