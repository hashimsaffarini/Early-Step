import { CircleCheck, CircleX, Gauge, Hourglass, ThumbsUp, TrendingUp } from 'lucide-react';
import { useId, type CSSProperties } from 'react';

import type { PlanSummaryFigures } from '@/services/api/planSummary';

import styles from './PlanProgressCard.module.css';

interface Chip {
  label: string;
  value: string;
  icon: typeof CircleCheck;
  tone: 'success' | 'warning' | 'danger' | 'primary' | 'violet';
}

export interface PlanProgressCardProps {
  summary: PlanSummaryFigures;
  /** Server initial-assessment score, when the staff role can read it. */
  assessmentScore?: number | undefined;
}

/**
 * Staff plan progress (client revision 2026-11): a large ring with the completion %, «X من Y
 * نشاطاً مكتمل» and figure chips. Every figure comes from `summarizePlan` over the real rows; a
 * figure the rows do not carry is hidden, never shown as 0.
 */
export function PlanProgressCard({ summary, assessmentScore }: PlanProgressCardProps) {
  const titleId = useId();
  const progress = summary.progress ?? 0;
  const chips: Chip[] = [
    {
      label: 'المكتملة',
      value: summary.completed.toString(),
      icon: CircleCheck,
      tone: 'success',
    },
    {
      label: 'المتبقية',
      value: summary.remaining.toString(),
      icon: Hourglass,
      tone: 'warning',
    },
  ];
  if (summary.correctAnswers !== null) {
    chips.push({
      label: 'الإجابات الصحيحة',
      value: summary.correctAnswers.toString(),
      icon: ThumbsUp,
      tone: 'success',
    });
  }
  if (summary.wrongAnswers !== null) {
    chips.push({
      label: 'الإجابات الخاطئة',
      value: summary.wrongAnswers.toString(),
      icon: CircleX,
      tone: 'danger',
    });
  }
  if (summary.averageScore !== null) {
    chips.push({
      label: 'متوسط النتيجة',
      value: `${summary.averageScore.toString()}%`,
      icon: Gauge,
      tone: 'violet',
    });
  }
  if (assessmentScore !== undefined) {
    chips.push({
      label: 'نتيجة التقييم المبدئي',
      value: `${Math.round(assessmentScore).toString()}%`,
      icon: TrendingUp,
      tone: 'primary',
    });
  }
  return (
    <section className={styles.card} aria-labelledby={titleId}>
      <div
        className={styles.ring}
        role="progressbar"
        aria-label="تقدّم الخطة التدريبية"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        aria-valuetext={`${progress.toString()}%`}
        style={{ '--progress': `${progress.toString()}%` } as CSSProperties}
      >
        <span className={styles.ringValue}>
          <bdi>{`${progress.toString()}%`}</bdi>
        </span>
      </div>
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          تقدّم الخطة التدريبية
        </h2>
        <p className={styles.count}>
          {`${summary.completed.toString()} من ${summary.total.toString()} نشاطاً مكتمل`}
        </p>
        <ul className={styles.chips} aria-label="ملخص الخطة التدريبية">
          {chips.map((chip) => {
            const Icon = chip.icon;
            return (
              <li key={chip.label} className={styles.chip} data-tone={chip.tone}>
                <Icon aria-hidden="true" />
                <span>{chip.label}</span>
                <bdi className={styles.chipValue}>{chip.value}</bdi>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
