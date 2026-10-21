import {
  BrainCircuit,
  BriefcaseMedical,
  FolderCog,
  Crown,
  Gamepad2,
  House,
  LayoutDashboard,
  MessageCircle,
  UserCog,
  Users,
} from 'lucide-react';

import type { NavLinkItem } from '@/components/layout/navigation';
import { showPracticeCatalogs } from '@/config/env';
import { ADMIN_PATHS, getAreaPaths, ROUTE_PATHS, type AreaRole } from '@/constants/routes';
import type { UserRole } from '@/types/roles';

/** Children nav label: the parent sees their own children, staff see the children they follow. */
const CHILDREN_LABEL: Record<Exclude<AreaRole, 'Admin'>, string> = {
  Parent: 'أطفالي',
  Teacher: 'الأطفال',
  Specialist: 'الأطفال',
};

/**
 * Sidebar order: dashboard, children, (Admin management pages), messages. Client revision 2026-10:
 * no reports entry for any role, and no children entry for the Admin (the Admin reaches children
 * through «إسناد الأخصائيين» and the users pages). The static practice tests/games are listed only
 * in development mock mode (they are not backend data).
 */
function buildAreaNav(role: AreaRole, unreadMessages: number): NavLinkItem[] {
  const paths = getAreaPaths(role);
  return [
    {
      to: paths.dashboard,
      label: role === 'Parent' ? 'الرئيسية' : 'لوحة القيادة',
      icon: role === 'Parent' ? House : LayoutDashboard,
    },
    ...(role === 'Admin' ? [] : [{ to: paths.children, label: CHILDREN_LABEL[role], icon: Users }]),
    ...(role === 'Admin'
      ? [
          { to: ADMIN_PATHS.users, label: 'المستخدمون', icon: UserCog },
          { to: ADMIN_PATHS.specialists, label: 'إسناد الأخصائيين', icon: BriefcaseMedical },
          { to: ADMIN_PATHS.content, label: 'إدارة المحتوى', icon: FolderCog },
        ]
      : []),
    ...(showPracticeCatalogs
      ? [
          { to: paths.tests, label: 'الاختبارات', icon: BrainCircuit },
          { to: paths.games, label: 'الألعاب', icon: Gamepad2 },
        ]
      : []),
    { to: paths.messages, label: 'الرسائل', icon: MessageCircle, badgeCount: unreadMessages },
  ];
}

/** Sidebar navigation per role. Every item is a real route — no dead links. */
export function getNavigation(role: UserRole, unreadMessages = 0): NavLinkItem[] {
  if (role === 'SuperAdmin') {
    return [{ to: ROUTE_PATHS.superAdmin, label: 'لوحة التحكم', icon: Crown, end: true }];
  }
  return buildAreaNav(role, unreadMessages);
}
