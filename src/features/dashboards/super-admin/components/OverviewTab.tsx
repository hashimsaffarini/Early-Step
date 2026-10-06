import { UsersRound } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { useDashboardStats } from '@/features/dashboards/api/dashboardsApi';
import type { PanelUser } from '@/features/dashboards/api/superAdminApi';
import { DashboardStatsSection } from '@/features/dashboards/components/DashboardStatsGrid';
import { cx } from '@/utils/classNames';

import { ROLE_DISPLAY, ROLE_ORDER } from '../roleDisplay';

import styles from './superAdmin.module.css';

export interface OverviewTabProps {
  /** All users (unfiltered `SuperAdmin/users`), or undefined while loading. */
  users: readonly PanelUser[] | undefined;
}

/** Stats from `GET SuperAdmin/dashboard` + users-by-role counted from the real user list. */
export function OverviewTab({ users }: OverviewTabProps) {
  const stats = useDashboardStats('superAdmin');
  return (
    <div className={styles.tab}>
      <DashboardStatsSection
        stats={stats.data}
        isPending={stats.isPending}
        error={stats.error}
        onRetry={() => void stats.refetch()}
        label="ملخص النظام"
      />
      {users ? (
        <section className={styles.tab} aria-labelledby="users-by-role-title">
          <SectionHeader id="users-by-role-title" title="المستخدمون حسب الدور" icon={UsersRound} />
          <ul className={styles.roleTiles}>
            {ROLE_ORDER.map((role) => {
              const display = ROLE_DISPLAY[role];
              return (
                <li key={role} className={cx(styles.roleTile, styles[role])}>
                  <display.icon aria-hidden="true" />
                  <p className={styles.roleCount}>
                    {users.filter((user) => user.role === role).length}
                  </p>
                  <p className={styles.roleLabel}>{display.label}</p>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
