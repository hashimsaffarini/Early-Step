import type { LucideIcon } from 'lucide-react';

/** A navigable sidebar entry. Built by the route module, not by the layout. */
export interface NavLinkItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Optional count badge (e.g. unread messages). Hidden when 0 or undefined. */
  badgeCount?: number;
  /** Match only the exact path (for index routes). */
  end?: boolean;
}

/**
 * A planned area that is not built yet. Rendered as a non-interactive item with a
 * "قريباً" badge — never as a link to an unfinished page.
 */
export interface UnavailableNavItem {
  label: string;
  icon: LucideIcon;
  unavailable: true;
}

export type NavItemConfig = NavLinkItem | UnavailableNavItem;

export function isNavLinkItem(item: NavItemConfig): item is NavLinkItem {
  return 'to' in item;
}

/** Signed-in user summary shown in the sidebar. Display values only. */
export interface ShellUser {
  name: string;
  roleLabel: string;
}
