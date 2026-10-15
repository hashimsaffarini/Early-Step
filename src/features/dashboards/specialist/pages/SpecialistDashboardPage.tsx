import { ArrowLeft, ClipboardCheck, FilePlus2, Users } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { getAreaPaths } from '@/constants/routes';
import { useDashboardStats } from '@/features/dashboards/api/dashboardsApi';
import { ChildrenDirectory } from '@/features/dashboards/components/ChildrenDirectory';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsSection } from '@/features/dashboards/components/DashboardStatsGrid';
import { glassLinkClassName } from '@/features/dashboards/components/glassLink';
import { StaffChildCard } from '@/features/dashboards/components/StaffChildCard';
import { useChildrenForRole } from '@/hooks/api/childResources';

const paths = getAreaPaths('Specialist');

export interface SpecialistDashboardPageProps {
  userName: string;
}

/**
 * Specialist dashboard: stats from `GET specialist/dashboard`, children from
 * `GET specialist/children`. Only server values are shown.
 */
export function SpecialistDashboardPage({ userName }: SpecialistDashboardPageProps) {
  const stats = useDashboardStats('specialist');
  const children = useChildrenForRole('Specialist');
  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="لوحة الأخصائي — متابعة الأطفال المعيّنين"
        tone="violet"
        actions={
          <>
            <Link to={paths.children} className={glassLinkClassName}>
              <Users aria-hidden="true" />
              كل الأطفال
            </Link>
            <Link to={paths.reports} className={glassLinkClassName}>
              <ClipboardCheck aria-hidden="true" />
              تقاريري
            </Link>
          </>
        }
      />
      <DashboardStatsSection
        stats={stats.data}
        isPending={stats.isPending}
        error={stats.error}
        onRetry={() => void stats.refetch()}
      />
      <ChildrenDirectory
        headingId="specialist-children-title"
        title="أطفالي"
        items={children.data}
        isPending={children.isPending}
        error={children.error}
        onRetry={() => void children.refetch()}
        searchLabel="ابحث باسم الطفل..."
        emptyTitle="لا يوجد أطفال مُسنَدون لك بعد"
        emptyDescription="يُسنِد المدير الأطفال إلى الأخصائي."
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
          <StaffChildCard
            child={child}
            profilePath={paths.childProfile(child.id)}
            extraAction={
              <Link
                to={paths.reportCreate}
                className={getButtonClassName({ variant: 'outline', fullWidth: true })}
                aria-label={`تقرير جديد عن ${child.fullName}`}
              >
                <FilePlus2 aria-hidden="true" />
                تقرير جديد
              </Link>
            }
          />
        )}
      />
    </div>
  );
}
