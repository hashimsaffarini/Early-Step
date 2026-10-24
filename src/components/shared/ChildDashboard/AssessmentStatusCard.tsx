import { ChevronLeft, CircleCheck, ClipboardCheck, Hourglass, Lock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Spinner } from '@/components/ui/Feedback';
import type { AssessmentStatus } from '@/hooks/api/assessmentStatus';
import { cx } from '@/utils/classNames';

import styles from './AssessmentStatusCard.module.css';

export interface AssessmentStatusCardProps {
  status: AssessmentStatus;
  /** The details page; the whole card links there. */
  to: string;
}

function summary(status: AssessmentStatus): {
  icon: typeof CircleCheck;
  label: string;
  detail: ReactNode;
} {
  switch (status.state) {
    case 'loading':
      return { icon: Hourglass, label: 'جارٍ التحميل…', detail: '' };
    case 'complete': {
      const categories = status.result.categories.length;
      return {
        icon: CircleCheck,
        label: 'مكتمل',
        detail: (
          <>
            النتيجة العامة: <bdi>{`${Math.round(status.result.overallScore).toString()}%`}</bdi>
            {categories > 0 ? ` · التصنيفات: ${categories.toString()}` : null}
          </>
        ),
      };
    }
    case 'incomplete':
      return { icon: Hourglass, label: 'لم يكتمل', detail: 'لم يكتمل التقييم الأولي بعد.' };
    case 'unavailable':
      return {
        icon: Lock,
        label: 'غير متاح',
        detail: 'نتيجة التقييم الأولي غير متاحة لهذا الحساب.',
      };
    case 'error':
      return { icon: Hourglass, label: 'تعذّر التحميل', detail: status.error.message };
  }
}

/**
 * «التقييم الأولي» as one compact card (client revision 2026-10): the real status and overall
 * result; the whole card is a link to the dedicated details page (keyboard: one link, visible
 * focus). Status is shown with an icon and words, never colour alone.
 */
export function AssessmentStatusCard({ status, to }: AssessmentStatusCardProps) {
  const { icon: Icon, label, detail } = summary(status);
  return (
    <Link to={to} className={styles.card} aria-label={`التقييم الأولي: ${label}. عرض التفاصيل`}>
      <span className={styles.icon} aria-hidden="true">
        <ClipboardCheck />
      </span>
      <span className={styles.body}>
        <span className={styles.title}>التقييم الأولي</span>
        <span
          className={cx(styles.status, status.state === 'complete' && styles.done)}
          aria-hidden="true"
        >
          {status.state === 'loading' ? <Spinner size="sm" /> : <Icon />}
          {label}
        </span>
        {detail ? <span className={styles.detail}>{detail}</span> : null}
      </span>
      <span className={styles.more} aria-hidden="true">
        عرض التفاصيل
        <ChevronLeft />
      </span>
    </Link>
  );
}
