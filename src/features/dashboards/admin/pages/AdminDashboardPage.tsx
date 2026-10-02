import { ArrowLeft, FileText, HeartHandshake, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { getAreaPaths } from '@/constants/routes';
import { ChildrenDirectory } from '@/features/dashboards/components/ChildrenDirectory';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsGrid } from '@/features/dashboards/components/DashboardStatsGrid';
import { StaffChildCard } from '@/features/dashboards/components/StaffChildCard';
import { MOCK_ROSTER_CHILDREN, MOCK_ROSTER_USERS } from '@/features/dashboards/mock/roster.mock';
import { RecentActivityCard } from '@/features/dashboards/parent/components/RecentActivityCard';
import { countReports, countUsersByRole } from '@/features/dashboards/roster';
import type { DashboardStat } from '@/features/dashboards/types';

import { MOCK_ADMIN_ACTIVITY } from '../mock/adminActivity.mock';

const paths = getAreaPaths('Admin');

function buildStats(): DashboardStat[] {
  const followUpTeam =
    countUsersByRole(MOCK_ROSTER_USERS, 'Specialist') +
    countUsersByRole(MOCK_ROSTER_USERS, 'Teacher');
  return [
    {
      label: 'الأطفال المسجّلون',
      value: MOCK_ROSTER_CHILDREN.length,
      icon: Users,
      tone: 'primary',
    },
    {
      label: 'أولياء الأمور',
      value: countUsersByRole(MOCK_ROSTER_USERS, 'Parent'),
      icon: UserRound,
      tone: 'success',
    },
    {
      label: 'الأخصائيون والمعلمون',
      value: followUpTeam,
      icon: HeartHandshake,
      tone: 'violet',
    },
    {
      label: 'التقارير',
      value: countReports(MOCK_ROSTER_CHILDREN),
      icon: FileText,
      tone: 'warning',
    },
  ];
}

export interface AdminDashboardPageProps {
  userName: string;
}

/**
 * Admin overview. Replit showed admins the parent dashboard; this keeps its visual language
 * (brand hero, stat row, child grid, activity side card) with admin-level content. UI only.
 */
export function AdminDashboardPage({ userName }: AdminDashboardPageProps) {
  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="نظرة عامة على الأطفال والفريق والتقارير."
        showDate
      />
      <DashboardStatsGrid stats={buildStats()} />
      <div className={dashboardPageStyles.columns}>
        <ChildrenDirectory
          headingId="admin-children-title"
          title="الأطفال"
          items={MOCK_ROSTER_CHILDREN}
          searchLabel="ابحث باسم الطفل..."
          emptyTitle="لا يوجد أطفال مسجّلون بعد"
          action={
            <Link
              to={paths.children}
              className={getButtonClassName({ variant: 'ghost', size: 'sm' })}
            >
              عرض الكل
              <ArrowLeft aria-hidden="true" />
            </Link>
          }
          renderCard={(child) => (
            <StaffChildCard child={child} profilePath={paths.childProfile(child.id)} showParent />
          )}
        />
        <RecentActivityCard items={MOCK_ADMIN_ACTIVITY} />
      </div>
    </div>
  );
}
