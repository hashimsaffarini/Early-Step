import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';

import styles from './preview.module.css';

const SAMPLE_OPTIONS = ['خيار 1', 'خيار 2', 'خيار 3', 'خيار 4'] as const;
const SAMPLE_STEP = 1;
const SAMPLE_TOTAL = 4;

/** Visual preview of the light child-facing layout — no activity logic. */
export function ChildPreviewPage() {
  return (
    <Card className={styles.childCard}>
      <h1>معاينة تخطيط نشاط الطفل</h1>
      <ProgressBar
        label="التقدّم"
        value={SAMPLE_STEP}
        max={SAMPLE_TOTAL}
        tone="success"
        showLabel
      />
      <p className={styles.muted}>سيُبنى مشغّل الأنشطة لاحقاً. هذه أزرار بحجم مناسب للأطفال.</p>
      <div className={styles.optionGrid}>
        {SAMPLE_OPTIONS.map((option) => (
          <button key={option} type="button" className={styles.option}>
            {option}
          </button>
        ))}
      </div>
    </Card>
  );
}
