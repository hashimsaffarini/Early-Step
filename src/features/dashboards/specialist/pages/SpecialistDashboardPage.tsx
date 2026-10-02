import {
  ArrowLeft,
  ClipboardCheck,
  FilePlus2,
  FileText,
  Hourglass,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { getAreaPaths } from '@/constants/routes';

import { ChildrenDirectory } from '@/features/dashboards/components/ChildrenDirectory';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsGrid } from '@/features/dashboards/components/DashboardStatsGrid';
import { glassLinkClassName } from '@/features/dashboards/components/glassLink';
import { StaffChildCard } from '@/features/dashboards/components/StaffChildCard';
import { pickChildren, SPECIALIST_CHILD_IDS } from '@/features/dashboards/mock/roster.mock';
import { countByStatus, countReports } from '@/features/dashboards/roster';
import type { DashboardStat, RosterChild } from '@/features/dashboards/types';

const paths = getAreaPaths('Specialist');

export interface SpecialistDashboardPageProps {
  userName: string;
  /** Children followed by the specialist (defaults to the TEMPORARY mock roster). */
  followedChildren?: readonly RosterChild[];
}

function buildStats(children: readonly RosterChild[]): DashboardStat[] {
  return [
    { label: 'الأطفال المتابَعون', value: children.length, icon: Users, tone: 'primary' },
    {
      label: 'خطط تدريبية نشطة',
      value: countByStatus(children, 'training-plan-active'),
      icon: Target,
      tone: 'violet',
    },
    { label: 'تقاريري', value: countReports(children), icon: FileText, tone: 'success' },
    {
      label: 'بانتظار خطة تدريبية',
      value: countByStatus(children, 'assessment-completed'),
      icon: Hourglass,
      tone: 'warning',
    },
  ];
}

/** Specialist dashboard (Replit SpecialistDashboard): violet hero, stats, "أطفالي". UI only. */
export function SpecialistDashboardPage({
  userName,
  followedChildren = pickChildren(SPECIALIST_CHILD_IDS),
}: SpecialistDashboardPageProps) {
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
      <DashboardStatsGrid stats={buildStats(followedChildren)} />
      <ChildrenDirectory
        headingId="specialist-children-title"
        title="أطفالي"
        items={followedChildren}
        searchLabel="ابحث باسم الطفل..."
        emptyTitle="لا يوجد أطفال مُسنَدون لك بعد"
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
                aria-label={`تقرير جديد عن ${child.name}`}
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
