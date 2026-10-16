import { ProgressBar } from '@/components/ui/Feedback';
import type { PlanActivity } from '@/services/api/childPlan';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './PlanSummary.module.css';

export interface PlanSummaryProps {
  activities: readonly PlanActivity[];
  /** The plan's server `progress` %, when the endpoint sends it. */
  serverProgress?: number | null | undefined;
}

interface Figure {
  label: string;
  value: string;
}

/**
 * Activity summary + completion % of a training plan, flat (no nested boxes). Only figures the
 * server data supports are shown (`summarizePlan`).
 */
export function PlanSummary({ activities, serverProgress = null }: PlanSummaryProps) {
  const summary = summarizePlan(activities, serverProgress);
  const figures: Figure[] = [
    { label: 'إجمالي الأنشطة', value: summary.total.toString() },
    { label: 'المنجزة', value: summary.completed.toString() },
    { label: 'المتبقية', value: summary.remaining.toString() },
  ];
  if (summary.correctAnswers !== null) {
    figures.push({ label: 'الإجابات الصحيحة', value: summary.correctAnswers.toString() });
  }
  if (summary.wrongAnswers !== null) {
    figures.push({ label: 'الإجابات الخاطئة', value: summary.wrongAnswers.toString() });
  }
  if (summary.averageScore !== null) {
    figures.push({ label: 'متوسط النتيجة', value: `${summary.averageScore.toString()}%` });
  }

  return (
    <div className={styles.summary}>
      <section aria-labelledby="plan-summary-title">
        <h3 id="plan-summary-title" className={styles.title}>
          ملخص الأنشطة
        </h3>
        <dl className={styles.figures}>
          {figures.map((figure) => (
            <div key={figure.label} className={styles.figure}>
              <dt className={styles.label}>{figure.label}</dt>
              <dd className={styles.value}>{figure.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {summary.progress !== null ? (
        <section aria-labelledby="plan-progress-title">
          <div className={styles.progressHead}>
            <h3 id="plan-progress-title" className={styles.title}>
              نسبة الإنجاز
            </h3>
            <span className={styles.percent} aria-hidden="true">
              <bdi>{`${summary.progress.toString()}%`}</bdi>
            </span>
          </div>
          <ProgressBar
            label="نسبة إنجاز الخطة"
            value={summary.progress}
            max={100}
            showLabel
            tone="success"
            valueText={`${summary.completed.toString()} من ${summary.total.toString()} أنشطة منجزة`}
          />
        </section>
      ) : null}
    </div>
  );
}
