import { Bell } from 'lucide-react';

import { getNavigation } from '@/app/layouts/areaNavigation';
import { LogoutButton } from '@/app/layouts/LogoutButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IconButton } from '@/components/ui/IconButton';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { useUnreadMessagesCount } from '@/features/chat';
import { useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

export interface RoleAreaLayoutProps {
  role: UserRole;
}

/** The backend has no notifications API (BLOCKED BY BACKEND) — the bell stays disabled. */
const NOTIFICATIONS_UNAVAILABLE = 'الإشعارات (قريباً)';

/**
 * Shell for every role area (rendered inside `RequireRole`). Shows the signed-in user from the
 * session and the unread-messages badge from `GET Chats/unread-count` (polled).
 */
export function RoleAreaLayout({ role }: RoleAreaLayoutProps) {
  const session = useSession();
  // The Super Admin area has no messages screen.
  const unreadMessages = useUnreadMessagesCount(role !== 'SuperAdmin');
  return (
    <DashboardLayout
      navItems={getNavigation(role, unreadMessages)}
      user={{ name: session?.user.name ?? '', roleLabel: ROLE_LABELS[role] }}
      headerActions={
        <IconButton label={NOTIFICATIONS_UNAVAILABLE} icon={Bell} variant="muted" disabled />
      }
      sidebarFooter={<LogoutButton />}
    />
  );
}
