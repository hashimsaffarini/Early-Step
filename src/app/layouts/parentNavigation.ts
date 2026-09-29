import { ClipboardCheck, FileText, House, MessageCircle, Target, Users } from 'lucide-react';

import type { NavItemConfig } from '@/components/layout/navigation';
import { ROUTE_PATHS } from '@/constants/routes';

/**
 * Parent sidebar. Dashboard and children exist; the other planned areas are shown as
 * unavailable ("قريباً") items — not links — until their screens are built.
 */
export const PARENT_NAV_ITEMS: readonly NavItemConfig[] = [
  { to: ROUTE_PATHS.parentDashboard, label: 'الرئيسية', icon: House },
  { to: ROUTE_PATHS.parentChildren, label: 'أطفالي', icon: Users },
  { label: 'التقييمات', icon: ClipboardCheck, unavailable: true },
  { label: 'الخطط التدريبية', icon: Target, unavailable: true },
  { label: 'التقارير', icon: FileText, unavailable: true },
  { label: 'الرسائل', icon: MessageCircle, unavailable: true },
];
