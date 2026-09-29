import { Bell } from 'lucide-react';

import { MOCK_PARENT_USER } from '@/app/dev/mockParentSession';
import { PARENT_NAV_ITEMS } from '@/app/layouts/parentNavigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { IconButton } from '@/components/ui/IconButton';

const NOTIFICATIONS_UNAVAILABLE = 'الإشعارات (قريباً)';

/**
 * Parent area shell. TEMPORARY: open access with a mock user while authentication
 * is not implemented — this is UI-development behaviour, not access control.
 */
export function ParentAreaLayout() {
  return (
    <DashboardLayout
      navItems={PARENT_NAV_ITEMS}
      user={MOCK_PARENT_USER}
      headerActions={
        <IconButton label={NOTIFICATIONS_UNAVAILABLE} icon={Bell} variant="muted" disabled />
      }
    />
  );
}
