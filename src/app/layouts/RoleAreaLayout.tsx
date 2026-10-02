import { MOCK_SESSION_USERS } from '@/app/dev/mockSessions';
import { getNavigation } from '@/app/layouts/areaNavigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getMockUnreadCount } from '@/features/chat';
import { NotificationsMenu, useNotifications } from '@/features/notifications';
import type { UserRole } from '@/types/roles';

export interface RoleAreaLayoutProps {
  role: UserRole;
}

/**
 * Shell for every role area. TEMPORARY: open access with a mock user while authentication
 * is not implemented — this is UI-development behaviour, not access control (see ROUTING.md).
 * Notifications state lives here so the sidebar bell and the mobile-header bell stay in sync.
 */
export function RoleAreaLayout({ role }: RoleAreaLayoutProps) {
  const notifications = useNotifications(role);
  return (
    <DashboardLayout
      navItems={getNavigation(role, getMockUnreadCount(role))}
      user={MOCK_SESSION_USERS[role]}
      headerActions={<NotificationsMenu {...notifications} />}
    />
  );
}
