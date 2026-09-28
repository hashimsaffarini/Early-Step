import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Palette,
  SquarePen,
} from 'lucide-react';

import { DEV_PREVIEW_PATHS } from '@/app/router/paths';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { NavItemConfig } from '@/components/layout/navigation';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

const SAMPLE_UNREAD = 3;

const PREVIEW_NAV: readonly NavItemConfig[] = [
  { to: DEV_PREVIEW_PATHS.root, label: 'نظرة عامة', icon: LayoutDashboard, end: true },
  { to: DEV_PREVIEW_PATHS.components, label: 'المكونات', icon: Palette },
  { to: DEV_PREVIEW_PATHS.forms, label: 'النماذج', icon: SquarePen },
  { to: DEV_PREVIEW_PATHS.auth, label: 'تخطيط الدخول', icon: FileText },
  {
    to: DEV_PREVIEW_PATHS.child,
    label: 'تخطيط الطفل',
    icon: MessageCircle,
    badgeCount: SAMPLE_UNREAD,
  },
];

/** Dashboard shell with sample navigation (dev preview only). */
export function PreviewShell() {
  return (
    <DashboardLayout
      navItems={PREVIEW_NAV}
      user={{ name: 'مستخدم تجريبي', roleLabel: 'معاينة' }}
      headerActions={<IconButton label="الإشعارات" icon={Bell} variant="muted" />}
      sidebarFooter={
        <Button variant="ghost" fullWidth iconStart={<LogOut aria-hidden="true" />} disabled>
          تسجيل الخروج
        </Button>
      }
    />
  );
}
