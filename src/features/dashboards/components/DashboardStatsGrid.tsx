import { BarChart3 } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/Button';
import type { AppError } from '@/services/http/apiError';

import type { DashboardStat } from '../types';

import styles from './DashboardStatsGrid.module.css';

export interface DashboardStatsGridProps {
  stats: readonly DashboardStat[];
  label?: string;
}

/** Row of dashboard metrics — only values the server returned, nothing invented. */
export function DashboardStatsGrid({ stats, label = 'ملخص' }: DashboardStatsGridProps) {
  return (
    <section aria-label={label}>
      <ul className={styles.grid}>
        {stats.map((stat) => (
          <li key={stat.key}>
            <StatCard label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface DashboardStatsSectionProps {
  stats: readonly DashboardStat[] | undefined;
  isPending: boolean;
  error: AppError | null;
  onRetry: () => void;
  label?: string;
}

/** Stats with loading / error (retry) / empty states. */
export function DashboardStatsSection({
  stats,
  isPending,
  error,
  onRetry,
  label,
}: DashboardStatsSectionProps) {
  if (isPending) return <LoadingState label="جارٍ تحميل الإحصائيات…" />;
  if (error) {
    return (
      <ErrorState
        title="تعذّر تحميل الإحصائيات"
        description={error.message}
        action={
          <Button variant="outline" onClick={onRetry}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }
  if (!stats || stats.length === 0) {
    return <EmptyState icon={<BarChart3 />} title="لا توجد إحصائيات متاحة من الخادم" />;
  }
  return <DashboardStatsGrid stats={stats} {...(label ? { label } : {})} />;
}
