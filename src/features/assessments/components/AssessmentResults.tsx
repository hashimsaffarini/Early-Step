import { CircleCheck, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router';

import { Confetti } from '@/components/players';
import { CategoryTile } from '@/components/shared/CategoryTile';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import { formatQuestionCount } from '../format';
import type { AssessmentSection, AssessmentSectionKey } from '../types';

import styles from './AssessmentResults.module.css';

export interface AssessmentResultsProps {
  childName: string;
  sections: readonly AssessmentSection[];
  answered: Partial<Record<AssessmentSectionKey, number>>;
  profilePath: string;
}

/**
 * Neutral completion screen. Replit showed scores, percentages, strengths and "support areas";
 * those are clinical-looking judgements, so this screen only confirms completion — the
 * specialist reviews the answers.
 */
export function AssessmentResults({
  childName,
  sections,
  answered,
  profilePath,
}: AssessmentResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={styles.results} aria-labelledby="assessment-results-title">
      <Confetti />
      <div className={styles.hero}>
        <span className={styles.trophy} aria-hidden="true">
          🏆
        </span>
        <h2 id="assessment-results-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          اكتمل التقييم الأولي
        </h2>
        <p className={styles.thanks}>{`شكراً لك يا ${childName}! أنهيت كل الأقسام.`}</p>
      </div>

      <Card className={styles.card}>
        <h3 className={styles.cardTitle}>الأقسام</h3>
        <ul className={styles.list}>
          {sections.map((section) => (
            <li key={section.key} className={styles.row}>
              <CategoryTile category={section.category} emoji={section.emoji} size="sm" />
              <div className={styles.rowText}>
                <p className={styles.rowTitle}>{section.title}</p>
                <p className={styles.rowMeta}>{formatQuestionCount(answered[section.key] ?? 0)}</p>
              </div>
              <Badge tone="success">
                <CircleCheck aria-hidden="true" size={14} />
                تم الإكمال
              </Badge>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          <Info aria-hidden="true" />
          سيراجع الأخصائي الإجابات ويضيف النتائج إلى ملف الطفل.
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
