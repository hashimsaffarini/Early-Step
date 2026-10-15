import { GraduationCap } from 'lucide-react';

import { getAreaPaths } from '@/constants/routes';
import { useDashboardStats } from '@/features/dashboards/api/dashboardsApi';
import { ChildrenDirectory } from '@/features/dashboards/components/ChildrenDirectory';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsSection } from '@/features/dashboards/components/DashboardStatsGrid';
import { StaffChildCard } from '@/features/dashboards/components/StaffChildCard';
import { useChildrenForRole } from '@/hooks/api/childResources';

const paths = getAreaPaths('Teacher');

export interface TeacherDashboardPageProps {
  userName: string;
}

/**
 * Teacher dashboard: greeting hero, stats from `GET Teacher/dashboard`, assigned children from
 * `GET Teacher/children`. Only server values are shown.
 */
export function TeacherDashboardPage({ userName }: TeacherDashboardPageProps) {
  const stats = useDashboardStats('teacher');
  const children = useChildrenForRole('Teacher');
  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="المعلم · متابعة الطلاب"
        tone="violet"
        greetingEmoji="👋"
        showAvatar
      />
      <DashboardStatsSection
        stats={stats.data}
        isPending={stats.isPending}
        error={stats.error}
        onRetry={() => void stats.refetch()}
      />
      <ChildrenDirectory
        headingId="teacher-students-title"
        title="طلاب الفصل"
        icon={GraduationCap}
        items={children.data}
        isPending={children.isPending}
        error={children.error}
        onRetry={() => void children.refetch()}
        searchLabel="ابحث عن طالب..."
        emptyTitle="لا يوجد طلاب مُسنَدون لك بعد"
        emptyDescription="يُسنِد الأخصائي الأطفال إلى المعلم."
        renderCard={(child) => (
          <StaffChildCard child={child} profilePath={paths.childProfile(child.id)} />
        )}
      />
    </div>
  );
}
