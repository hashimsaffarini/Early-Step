import { Info } from 'lucide-react';

import { ProgressBar } from '@/components/ui/Feedback';
import type { AssessmentResult } from '@/services/api/assessmentResult';

import styles from './profile.module.css';

/** The server's initial-assessment result, in neutral words (no diagnosis or interpretation). */
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
  return (
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
              <ProgressBar label={category.name} value={category.percentage} max={100} showLabel />
            </li>
          ))}
        </ul>
      ) : null}
      <p className={styles.muted}>
        <Info aria-hidden="true" size={16} /> هذه نتيجة مبدئية يراجعها الأخصائي، وليست تشخيصاً.
      </p>
    </>
  );
}
