import { StatCard } from '@/components/shared/StatCard';

import type { DashboardStat } from '../types';

import styles from './DashboardStatsGrid.module.css';

export interface DashboardStatsGridProps {
  stats: readonly DashboardStat[];
  label?: string;
}

/** Row of dashboard metrics — counts derived from the mock data, nothing invented. */
export function DashboardStatsGrid({ stats, label = 'ملخص' }: DashboardStatsGridProps) {
  return (
    <section aria-label={label}>
      <ul className={styles.grid}>
        {stats.map((stat) => (
          <li key={stat.label}>
            <StatCard label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
          </li>
        ))}
      </ul>
    </section>
  );
}
