import { Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import { formatQuestionCount } from '../format';

import styles from './AssessmentResults.module.css';

export interface AssessmentResultsProps {
  childName: string;
  /** Answers the server accepted. */
  answered: number;
  profilePath: string;
}

/**
 * Shown only after `complete` succeeded. Neutral: the backend returns no result and has no
 * endpoint to read assessment results (BLOCKED BY BACKEND), so no score is shown or implied.
 */
export function AssessmentResults({ childName, answered, profilePath }: AssessmentResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={styles.results} aria-labelledby="assessment-results-title">
      <div className={styles.hero}>
        <span className={styles.trophy} aria-hidden="true">
          🏆
        </span>
        <h2 id="assessment-results-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          تم إرسال التقييم
        </h2>
        <p className={styles.thanks}>{`شكراً لك يا ${childName}! أنهيت أسئلة التقييم.`}</p>
      </div>

      <Card className={styles.card}>
        <p className={styles.rowTitle}>{`تم إرسال ${formatQuestionCount(answered)} إلى المنصة.`}</p>
        <p className={styles.note}>
          <Info aria-hidden="true" />
          لا يعرض التطبيق نتائج التقييم حالياً: لا يوفّر الخادم بعدُ نتائج يمكن قراءتها.
        </p>
      </Card>

      <Link
        to={profilePath}
        className={cx(getButtonClassName({ size: 'lg', fullWidth: true }), styles.action)}
      >
        العودة إلى ملف الطفل
      </Link>
    </section>
  );
}
