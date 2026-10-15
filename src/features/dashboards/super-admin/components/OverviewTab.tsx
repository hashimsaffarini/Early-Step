import { UsersRound } from 'lucide-react';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { useDashboardStats, useUsersByRole } from '@/features/dashboards/api/dashboardsApi';
import { DashboardStatsSection } from '@/features/dashboards/components/DashboardStatsGrid';
import { cx } from '@/utils/classNames';

import { ROLE_DISPLAY, ROLE_ORDER } from '../roleDisplay';

import styles from './superAdmin.module.css';

/** Users by role, exactly as `GET SuperAdmin/dashboard` counts them (`usersByRole`). */
function UsersByRoleSection() {
  const query = useUsersByRole();
  let content;
  if (query.isPending) {
    content = <LoadingState label="جارٍ تحميل الأعداد…" />;
  } else if (query.isError) {
    content = (
      <ErrorState
        title="تعذّر تحميل أعداد المستخدمين"
        description={query.error.message}
        action={
          <Button variant="outline" onClick={() => void query.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (!query.data || query.data.length === 0) {
    // The server did not send per-role counts: say so rather than counting ourselves.
    content = <p className={styles.muted}>لم يُرسل الخادم أعداد المستخدمين حسب الدور.</p>;
  } else {
    const counts = query.data;
    content = (
      <ul className={styles.roleTiles}>
        {ROLE_ORDER.flatMap((role) => {
          const entry = counts.find((item) => item.role === role);
          if (!entry) return [];
          const display = ROLE_DISPLAY[role];
          return [
            <li key={role} className={cx(styles.roleTile, styles[role])}>
              <display.icon aria-hidden="true" />
              <p className={styles.roleCount}>{entry.count}</p>
              <p className={styles.roleLabel}>{display.label}</p>
            </li>,
          ];
        })}
      </ul>
    );
  }
  return (
    <section className={styles.tab} aria-labelledby="users-by-role-title">
      <SectionHeader id="users-by-role-title" title="المستخدمون حسب الدور" icon={UsersRound} />
      {content}
    </section>
  );
}

/** Stats and users-by-role from `GET SuperAdmin/dashboard`. */
export function OverviewTab() {
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
      <UsersByRoleSection />
    </div>
  );
}
