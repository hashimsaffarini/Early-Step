import { ClipboardCheck, FileText, GraduationCap, Target, Users } from 'lucide-react';

import { getAreaPaths } from '@/constants/routes';

import { ChildrenDirectory } from '@/features/dashboards/components/ChildrenDirectory';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import { DashboardStatsGrid } from '@/features/dashboards/components/DashboardStatsGrid';
import { StaffChildCard } from '@/features/dashboards/components/StaffChildCard';
import { pickChildren, TEACHER_CHILD_IDS } from '@/features/dashboards/mock/roster.mock';
import { countByStatus, countReports } from '@/features/dashboards/roster';
import type { DashboardStat, RosterChild } from '@/features/dashboards/types';

const paths = getAreaPaths('Teacher');

export interface TeacherDashboardPageProps {
  userName: string;
  /** Assigned students (defaults to the TEMPORARY mock roster). */
  students?: readonly RosterChild[];
}

function buildStats(students: readonly RosterChild[]): DashboardStat[] {
  const activePlans = countByStatus(students, 'training-plan-active');
  return [
    { label: 'طلابي', value: students.length, icon: Users, tone: 'primary' },
    { label: 'خطط تدريبية نشطة', value: activePlans, icon: Target, tone: 'violet' },
    {
      label: 'تقييمات مكتملة',
      value: activePlans + countByStatus(students, 'assessment-completed'),
      icon: ClipboardCheck,
      tone: 'success',
    },
    { label: 'تقارير الفصل', value: countReports(students), icon: FileText, tone: 'warning' },
  ];
}

/** Teacher dashboard (Replit TeacherDashboard): greeting hero, stats, "طلاب الفصل". UI only. */
export function TeacherDashboardPage({
  userName,
  students = pickChildren(TEACHER_CHILD_IDS),
}: TeacherDashboardPageProps) {
  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="المعلم · متابعة الطلاب"
        tone="violet"
        greetingEmoji="👋"
        showAvatar
      />
      <DashboardStatsGrid stats={buildStats(students)} />
      <ChildrenDirectory
        headingId="teacher-students-title"
        title="طلاب الفصل"
        icon={GraduationCap}
        items={students}
        searchLabel="ابحث عن طالب..."
        emptyTitle="لا يوجد طلاب مُسنَدون لك بعد"
        emptyDescription="تواصل مع المسؤول لإسناد طلاب لفصلك."
        renderCard={(child) => (
          <StaffChildCard child={child} profilePath={paths.childProfile(child.id)} />
        )}
      />
    </div>
  );
}
