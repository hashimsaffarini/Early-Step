import { getNavigation } from '@/app/layouts/areaNavigation';
import { LogoutButton } from '@/app/layouts/LogoutButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { getMockUnreadCount } from '@/features/chat';
import { NotificationsMenu, useNotifications } from '@/features/notifications';
import { useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

export interface RoleAreaLayoutProps {
  role: UserRole;
}

/**
 * Shell for every role area (rendered inside `RequireRole`). Shows the signed-in user from the
 * session. Notifications state lives here so the sidebar and mobile-header bells stay in sync.
 */
export function RoleAreaLayout({ role }: RoleAreaLayoutProps) {
  const session = useSession();
  const notifications = useNotifications(role);
  return (
    <DashboardLayout
      navItems={getNavigation(role, getMockUnreadCount(role))}
      user={{ name: session?.user.name ?? '', roleLabel: ROLE_LABELS[role] }}
      headerActions={<NotificationsMenu {...notifications} />}
      sidebarFooter={<LogoutButton />}
    />
  );
}
