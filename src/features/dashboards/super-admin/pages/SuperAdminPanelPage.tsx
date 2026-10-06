import { FileText, LayoutDashboard, UserRound, Users } from 'lucide-react';
import { useState } from 'react';

import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { useSuperAdminUsers } from '@/features/dashboards/api/superAdminApi';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';

import { ChildrenTab } from '../components/ChildrenTab';
import { OverviewTab } from '../components/OverviewTab';
import { ReportsTab } from '../components/ReportsTab';
import { UsersTab } from '../components/UsersTab';

type PanelTab = 'overview' | 'users' | 'children' | 'reports';

export interface SuperAdminPanelPageProps {
  userName: string;
}

/**
 * Super Admin panel (Replit `/admin`) in the Early Step light language: dashboard stats, users and
 * children from the Super Admin endpoints. Read-only — the API offers no user management actions.
 */
export function SuperAdminPanelPage({ userName }: SuperAdminPanelPageProps) {
  const [tab, setTab] = useState<PanelTab>('overview');
  const allUsers = useSuperAdminUsers();

  const tabItems: readonly TabItem<PanelTab>[] = [
    {
      value: 'overview',
      label: 'نظرة عامة',
      icon: <LayoutDashboard aria-hidden="true" size={16} />,
    },
    {
      value: 'users',
      label: 'المستخدمون',
      ...(allUsers.data ? { count: allUsers.data.length } : {}),
      icon: <UserRound aria-hidden="true" size={16} />,
    },
    { value: 'children', label: 'الأطفال', icon: <Users aria-hidden="true" size={16} /> },
    { value: 'reports', label: 'التقارير', icon: <FileText aria-hidden="true" size={16} /> },
  ];

  return (
    <div className={dashboardPageStyles.page}>
      <DashboardGreetingBanner
        name={userName}
        subtitle="لديك تحكم كامل في النظام — استخدم الصلاحيات بمسؤولية."
        tone="violet"
        greetingEmoji="👑"
      />
      <Tabs label="أقسام لوحة التحكم" items={tabItems} value={tab} onChange={setTab}>
        {tab === 'overview' ? <OverviewTab users={allUsers.data} /> : null}
        {tab === 'users' ? <UsersTab /> : null}
        {tab === 'children' ? <ChildrenTab /> : null}
        {tab === 'reports' ? <ReportsTab /> : null}
      </Tabs>
    </div>
  );
}
