import { FolderCog, UserCog } from 'lucide-react';
import { Link } from 'react-router';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ADMIN_PATHS } from '@/constants/routes';
import { useDashboardStats } from '@/features/dashboards/api/dashboardsApi';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsSection } from '@/features/dashboards/components/DashboardStatsGrid';

import styles from './AdminDashboardPage.module.css';

export interface AdminDashboardPageProps {
  userName: string;
}

/**
 * Admin overview: stats from `GET Admin/dashboard` (server labels). The API has no admin
 * children list or activity feed, so the page links to users (parents → children → assign
 * specialist) and content management instead of showing invented lists.
 */
export function AdminDashboardPage({ userName }: AdminDashboardPageProps) {
  const stats = useDashboardStats('admin');
  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="نظرة عامة على المستخدمين والأطفال والمحتوى."
        showDate
      />
      <DashboardStatsSection
        stats={stats.data}
        isPending={stats.isPending}
        error={stats.error}
        onRetry={() => void stats.refetch()}
      />
      <section aria-labelledby="admin-shortcuts-title" className={styles.shortcuts}>
        <SectionHeader id="admin-shortcuts-title" title="إجراءات سريعة" icon={UserCog} />
        <div className={styles.grid}>
          <Card className={styles.card}>
            <h3 className={styles.cardTitle}>المستخدمون والأطفال</h3>
            <p className={styles.cardText}>
              تصفّح أولياء الأمور وأطفالهم، وأسنِد الأطفال إلى أخصائي.
            </p>
            <Link to={ADMIN_PATHS.users} className={getButtonClassName({ variant: 'soft' })}>
              <UserCog aria-hidden="true" />
              إدارة المستخدمين
            </Link>
          </Card>
          <Card className={styles.card}>
            <h3 className={styles.cardTitle}>المحتوى</h3>
            <p className={styles.cardText}>التصنيفات والأنشطة والأسئلة والتقييم المبدئي.</p>
            <Link to={ADMIN_PATHS.content} className={getButtonClassName({ variant: 'soft' })}>
              <FolderCog aria-hidden="true" />
              إدارة المحتوى
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
}
