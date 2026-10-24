import { getNavigation } from '@/app/layouts/areaNavigation';
import { LogoutButton } from '@/app/layouts/LogoutButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { useUnreadMessagesCount } from '@/hooks/api/useUnreadMessagesCount';
import { useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

export interface RoleAreaLayoutProps {
  role: UserRole;
}

/**
 * Shell for every role area (rendered inside `RequireRole`). Shows the signed-in user from the
 * session and the unread-messages badge from `GET Chats/unread-count` (polled).
 */
export function RoleAreaLayout({ role }: RoleAreaLayoutProps) {
  const session = useSession();
  // The Super Admin area has no messages screen.
  const unreadMessages = useUnreadMessagesCount(role !== 'SuperAdmin');
  // Client revisions 2026-10: no notifications icon in any area (the backend has no
  // notifications API); the Parent area also has no logo.
  return (
    <DashboardLayout
      navItems={getNavigation(role, unreadMessages)}
      user={{ name: session?.user.name ?? '', roleLabel: ROLE_LABELS[role] }}
      showBrand={role !== 'Parent'}
      sidebarFooter={<LogoutButton />}
    />
  );
}
