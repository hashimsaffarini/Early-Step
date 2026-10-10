import { Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';
import { cx } from '@/utils/classNames';

import type { AssessmentResult } from '../api/assessmentApi';
import { formatQuestionCount } from '../format';

import styles from './AssessmentResults.module.css';

export interface AssessmentResultsProps {
  childName: string;
  /** Answers the server accepted in this session; null when showing a saved result. */
  answered: number | null;
  /** Result from `complete` or `GET …/result` (null if the server sent none). */
  result: AssessmentResult | null;
  profilePath: string;
}

/**
 * Shown after `complete` succeeded, or when the child already has a saved result. Shows exactly
 * the result the server returned (overall score + per-category percentage) in neutral words — no
 * diagnosis or interpretation is added.
 */
export function AssessmentResults({
  childName,
  answered,
  result,
  profilePath,
}: AssessmentResultsProps) {
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
        {answered === null ? null : (
          <p
            className={styles.rowTitle}
          >{`تم إرسال ${formatQuestionCount(answered)} إلى المنصة.`}</p>
        )}
        {result ? (
          <>
            <ProgressBar
              label="النتيجة العامة للتقييم المبدئي"
              value={result.overallScore}
              max={100}
              showLabel
            />
            {result.categories.length > 0 ? (
              <ul className={styles.list} aria-label="النتيجة حسب التصنيف">
                {result.categories.map((category) => (
                  <li key={category.name}>
                    <ProgressBar
                      label={category.name}
                      value={category.percentage}
                      max={100}
                      showLabel
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
        <p className={styles.note}>
          <Info aria-hidden="true" />
          {result
            ? 'هذه نتيجة مبدئية يراجعها الأخصائي، وليست تشخيصاً.'
            : 'لم يُرجع الخادم نتيجة لهذا التقييم.'}
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
