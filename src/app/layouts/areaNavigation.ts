import {
  BrainCircuit,
  Crown,
  FileText,
  Gamepad2,
  House,
  LayoutDashboard,
  MessageCircle,
  Users,
} from 'lucide-react';

import type { NavLinkItem } from '@/components/layout/navigation';
import { getAreaPaths, ROUTE_PATHS, type AreaRole } from '@/constants/routes';
import type { UserRole } from '@/types/roles';

/** Children nav label: the parent sees their own children, staff see the children they follow. */
const CHILDREN_LABEL: Record<AreaRole, string> = {
  Parent: 'أطفالي',
  Teacher: 'الأطفال',
  Specialist: 'الأطفال',
  Admin: 'الأطفال',
};

/** Replit sidebar order: dashboard, children, tests, games, reports, messages. */
function buildAreaNav(role: AreaRole, unreadMessages: number): NavLinkItem[] {
  const paths = getAreaPaths(role);
  return [
    {
      to: paths.dashboard,
      label: role === 'Parent' ? 'الرئيسية' : 'لوحة القيادة',
      icon: role === 'Parent' ? House : LayoutDashboard,
    },
    { to: paths.children, label: CHILDREN_LABEL[role], icon: Users },
    { to: paths.tests, label: 'الاختبارات', icon: BrainCircuit },
    { to: paths.games, label: 'الألعاب', icon: Gamepad2 },
    { to: paths.reports, label: 'التقارير', icon: FileText },
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
