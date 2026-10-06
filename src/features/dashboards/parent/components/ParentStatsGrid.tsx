import { FileText, ListChecks, Users } from 'lucide-react';

import { StatCard } from '@/components/shared/StatCard';

import type { ParentDashboardStats } from '../types';

import styles from './ParentStatsGrid.module.css';

const PENDING = '…';

export interface ParentStatsGridProps {
  stats: ParentDashboardStats;
}

/** Counts from the API only (children list, plan summaries, child reports). */
export function ParentStatsGrid({ stats }: ParentStatsGridProps) {
  return (
    <section aria-label="ملخص">
      <ul className={styles.grid}>
        <li>
          <StatCard label="عدد الأطفال" value={stats.children} icon={Users} tone="primary" />
        </li>
        <li>
          <StatCard
            label="أنشطة الخطط التدريبية"
            value={stats.planActivities ?? PENDING}
            icon={ListChecks}
            tone="warning"
          />
        </li>
        <li>
          <StatCard
            label="التقارير"
            value={stats.reports ?? PENDING}
            icon={FileText}
            tone="violet"
          />
        </li>
      </ul>
    </section>
  );
}
