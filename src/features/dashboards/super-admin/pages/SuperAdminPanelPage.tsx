import { FileText, LayoutDashboard, UserRound, Users } from 'lucide-react';
import { useState } from 'react';

import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { DashboardGreetingBanner } from '@/features/dashboards/components/DashboardGreetingBanner';
import { dashboardPageStyles } from '@/features/dashboards/components/dashboardPageStyles';
import {
  MOCK_ROSTER_CHILDREN,
  MOCK_ROSTER_REPORTS,
  MOCK_ROSTER_USERS,
} from '@/features/dashboards/mock/roster.mock';
import type { RosterUser } from '@/features/dashboards/types';

import { ChildrenTab } from '../components/ChildrenTab';
import { OverviewTab } from '../components/OverviewTab';
import { ReportsTab } from '../components/ReportsTab';
import { UsersTab } from '../components/UsersTab';

type PanelTab = 'overview' | 'users' | 'children' | 'reports';

export interface SuperAdminPanelPageProps {
  userName: string;
  /** Accounts shown in the panel (defaults to the TEMPORARY mock roster). */
  initialUsers?: readonly RosterUser[];
}

/**
 * Super Admin panel (Replit `/admin`). Replit used a separate dark app; this uses the Early
 * Step light language inside the shared shell. Deleting a user only changes local state.
 */
export function SuperAdminPanelPage({
  userName,
  initialUsers = MOCK_ROSTER_USERS,
}: SuperAdminPanelPageProps) {
  const [tab, setTab] = useState<PanelTab>('overview');
  const [users, setUsers] = useState<readonly RosterUser[]>(initialUsers);
  const currentUserId = initialUsers.find(
    (user) => user.role === 'SuperAdmin' && user.name === userName,
  )?.id;

  const tabItems: readonly TabItem<PanelTab>[] = [
    {
      value: 'overview',
      label: 'نظرة عامة',
      icon: <LayoutDashboard aria-hidden="true" size={16} />,
    },
    {
      value: 'users',
      label: 'المستخدمون',
      count: users.length,
      icon: <UserRound aria-hidden="true" size={16} />,
    },
    {
      value: 'children',
      label: 'الأطفال',
      count: MOCK_ROSTER_CHILDREN.length,
      icon: <Users aria-hidden="true" size={16} />,
    },
    {
      value: 'reports',
      label: 'التقارير',
      count: MOCK_ROSTER_REPORTS.length,
      icon: <FileText aria-hidden="true" size={16} />,
    },
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
        {tab === 'overview' ? (
          <OverviewTab users={users} roster={MOCK_ROSTER_CHILDREN} reports={MOCK_ROSTER_REPORTS} />
        ) : null}
        {tab === 'users' ? (
          <UsersTab
            users={users}
            currentUserId={currentUserId}
            onDelete={(userId) => {
              setUsers((current) => current.filter((user) => user.id !== userId));
            }}
          />
        ) : null}
        {tab === 'children' ? <ChildrenTab roster={MOCK_ROSTER_CHILDREN} /> : null}
        {tab === 'reports' ? <ReportsTab reports={MOCK_ROSTER_REPORTS} /> : null}
      </Tabs>
    </div>
  );
}
