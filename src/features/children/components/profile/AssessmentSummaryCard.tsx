import { CalendarDays, ClipboardCheck, Layers } from 'lucide-react';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildAssessment } from '@/features/children/types';

import { ASSESSMENT_STATE_DISPLAY } from './labels';
import styles from './profile.module.css';

const HEADING_ID = 'profile-assessment-title';

const SUMMARY_TEXT = {
  completed: 'تم إكمال التقييم المبدئي',
  'in-progress': 'التقييم المبدئي قيد التنفيذ',
  'not-started': 'لم يبدأ التقييم المبدئي بعد',
} as const;

export function AssessmentSummaryCard({ assessment }: { assessment: ChildAssessment | undefined }) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="التقييم المبدئي"
        icon={ClipboardCheck}
        iconTone="primary"
        action={
          assessment ? (
            <Badge tone={ASSESSMENT_STATE_DISPLAY[assessment.state].tone} hasDot>
              {ASSESSMENT_STATE_DISPLAY[assessment.state].label}
            </Badge>
          ) : undefined
        }
      />
      <p className={styles.lead}>{SUMMARY_TEXT[assessment?.state ?? 'not-started']}</p>
      {assessment?.state === 'completed' ? (
        <ul className={styles.meta}>
          {assessment.completedAt ? (
            <li>
              <CalendarDays aria-hidden="true" />
              تاريخ الإكمال: {formatDisplayDate(assessment.completedAt)}
            </li>
          ) : null}
          {assessment.totalSections ? (
            <li>
              <Layers aria-hidden="true" />
              الأقسام المكتملة: {assessment.completedSections ?? 0} من {assessment.totalSections}
            </li>
          ) : null}
        </ul>
      ) : (
        <p className={styles.muted}>
          يتكوّن التقييم المبدئي من أنشطة وألعاب قصيرة مناسبة لعمر الطفل.
        </p>
      )}
      {assessment?.state === 'completed' ? null : (
        <div className={styles.footer}>
          <ComingSoonButton size="md">بدء التقييم</ComingSoonButton>
        </div>
      )}
    </Card>
  );
}
