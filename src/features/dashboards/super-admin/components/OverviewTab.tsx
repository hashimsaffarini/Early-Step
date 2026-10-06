import { FileText, Target, UserRound, Users, UsersRound } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { DashboardStatsGrid } from '@/features/dashboards/components/DashboardStatsGrid';
import { countByStatus, countUsersByRole } from '@/features/dashboards/roster';
import type {
  DashboardStat,
  RosterChild,
  RosterReport,
  RosterUser,
} from '@/features/dashboards/types';
import { cx } from '@/utils/classNames';

import { ROLE_DISPLAY, ROLE_ORDER } from '../roleDisplay';

import styles from './superAdmin.module.css';

export interface OverviewTabProps {
  users: readonly RosterUser[];
  roster: readonly RosterChild[];
  reports: readonly RosterReport[];
}

export function OverviewTab({ users, roster, reports }: OverviewTabProps) {
  const stats: DashboardStat[] = [
    { label: 'إجمالي المستخدمين', value: users.length, icon: UserRound, tone: 'primary' },
    { label: 'إجمالي الأطفال', value: roster.length, icon: Users, tone: 'success' },
    { label: 'التقارير', value: reports.length, icon: FileText, tone: 'violet' },
    {
      label: 'خطط تدريبية نشطة',
      value: countByStatus(roster, 'training-plan-active'),
      icon: Target,
      tone: 'warning',
    },
  ];

  return (
    <div className={styles.tab}>
      <DashboardStatsGrid stats={stats} label="ملخص النظام" />
      <section className={styles.tab} aria-labelledby="users-by-role-title">
        <SectionHeader id="users-by-role-title" title="المستخدمون حسب الدور" icon={UsersRound} />
        <ul className={styles.roleTiles}>
          {ROLE_ORDER.map((role) => {
            const display = ROLE_DISPLAY[role];
            return (
              <li key={role} className={cx(styles.roleTile, styles[role])}>
                <display.icon aria-hidden="true" />
                <p className={styles.roleCount}>{countUsersByRole(users, role)}</p>
                <p className={styles.roleLabel}>{display.label}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
