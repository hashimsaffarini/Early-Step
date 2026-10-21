import { ListChecks, RotateCcw, Users } from 'lucide-react';

import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/Button';

import type { DerivedCount, ParentDashboardStats } from '../types';

import styles from './ParentStatsGrid.module.css';

function display(count: DerivedCount): string | number {
  if (count === 'loading') return '…';
  if (count === 'error') return '—';
  return count;
}

export interface ParentStatsGridProps {
  stats: ParentDashboardStats;
  /** Re-fetches the per-child queries after a failure. */
  onRetry: () => void;
}

/** Counts from the API only (children list, plan summaries). No reports (client 2026-10). */
export function ParentStatsGrid({ stats, onRetry }: ParentStatsGridProps) {
  const failed = stats.planActivities === 'error';
  return (
    <section aria-label="ملخص">
      <ul className={styles.grid}>
        <li>
          <StatCard label="عدد الأطفال" value={stats.children} icon={Users} tone="primary" />
        </li>
        <li>
          <StatCard
            label="أنشطة الخطط التدريبية"
            value={display(stats.planActivities)}
            icon={ListChecks}
            tone="warning"
          />
        </li>
      </ul>
      {failed ? (
        <p className={styles.error} role="alert">
          تعذّر تحميل بعض الأرقام من الخادم.
          <Button
            variant="outline"
            size="sm"
            iconStart={<RotateCcw aria-hidden="true" />}
            onClick={onRetry}
          >
            إعادة المحاولة
          </Button>
        </p>
      ) : null}
    </section>
  );
}
