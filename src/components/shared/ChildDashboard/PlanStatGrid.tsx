import { CircleCheck, CircleX, Gauge, Hourglass, ListChecks, ThumbsUp } from 'lucide-react';

import { StatCard, type StatCardProps } from '@/components/shared/StatCard';
import type { PlanSummaryFigures } from '@/services/api/planSummary';

import styles from './PlanStatGrid.module.css';

export interface PlanStatGridProps {
  summary: PlanSummaryFigures;
  compact?: boolean;
  assessmentScore?: number | undefined;
}

/**
 * The plan's summary as dashboard stat cards. Source: `summarizePlan` over the real plan rows —
 * total / completed / remaining always; correct, wrong and mean score only when the rows carry them
 * (a missing figure is hidden, never shown as 0).
 */
export function PlanStatGrid({ summary, compact = false, assessmentScore }: PlanStatGridProps) {
  const stats: StatCardProps[] = [
    { label: 'إجمالي الأنشطة', value: summary.total, icon: ListChecks, tone: 'primary' },
    { label: 'المكتملة', value: summary.completed, icon: CircleCheck, tone: 'success' },
    { label: 'المتبقية', value: summary.remaining, icon: Hourglass, tone: 'warning' },
  ];
  if (assessmentScore !== undefined) {
    stats.unshift({
      label: 'نتيجة التقييم المبدئي',
      value: `${Math.round(assessmentScore).toString()}%`,
      icon: Gauge,
      tone: 'primary',
    });
  }
  if (assessmentScore === undefined && summary.averageScore !== null) {
    stats.push({
      label: 'متوسط النتيجة',
      value: `${summary.averageScore.toString()}%`,
      icon: Gauge,
      tone: 'violet',
    });
  }
  if (!compact && summary.correctAnswers !== null) {
    stats.push({
      label: 'الإجابات الصحيحة',
      value: summary.correctAnswers,
      icon: ThumbsUp,
      tone: 'success',
    });
  }
  if (!compact && summary.wrongAnswers !== null) {
    stats.push({
      label: 'الإجابات الخاطئة',
      value: summary.wrongAnswers,
      icon: CircleX,
      tone: 'danger',
    });
  }
  return (
    <div className={styles.wrap}>
      <ul className={styles.grid} aria-label="ملخص الخطة التدريبية">
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCard {...stat} />
          </li>
        ))}
      </ul>
    </div>
  );
}
