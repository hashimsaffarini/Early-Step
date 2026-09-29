import { ClipboardCheck, FileText, Target, Users } from 'lucide-react';

import { StatCard } from '@/components/shared/StatCard';

import type { ParentDashboardStats } from '../types';

import styles from './ParentStatsGrid.module.css';

export interface ParentStatsGridProps {
  stats: ParentDashboardStats;
}

export function ParentStatsGrid({ stats }: ParentStatsGridProps) {
  return (
    <section aria-label="ملخص">
      <ul className={styles.grid}>
        <li>
          <StatCard label="عدد الأطفال" value={stats.children} icon={Users} tone="primary" />
        </li>
        <li>
          <StatCard
            label="التقييمات المكتملة"
            value={stats.completedAssessments}
            icon={ClipboardCheck}
            tone="success"
          />
        </li>
        <li>
          <StatCard
            label="الخطط التدريبية"
            value={stats.trainingPlans}
            icon={Target}
            tone="warning"
          />
        </li>
        <li>
          <StatCard label="التقارير" value={stats.reports} icon={FileText} tone="violet" />
        </li>
      </ul>
    </section>
  );
}
