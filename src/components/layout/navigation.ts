import type { LucideIcon } from 'lucide-react';

/** One entry in a role's sidebar navigation. Built by the route module, not by the layout. */
export interface NavItemConfig {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Optional count badge (e.g. unread messages). Hidden when 0 or undefined. */
  badgeCount?: number;
  /** Match only the exact path (for index routes). */
  end?: boolean;
}

/** Signed-in user summary shown in the sidebar. Display values only. */
export interface ShellUser {
  name: string;
  roleLabel: string;
}
