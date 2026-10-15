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
  /** Answers the server accepted in this session. */
  answered: number;
  profilePath: string;
}

/**
 * Shown after `complete` succeeded. The parent's flow ends with the submission (product decision
 * 2026-10-14): the result itself is reviewed by the specialist, so no score is shown here.
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
          يراجع الأخصائي نتيجة التقييم ويتابع معك الخطوات التالية.
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
