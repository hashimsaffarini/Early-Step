import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import { isNavLinkItem, type NavItemConfig, type ShellUser } from '@/components/layout/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { cx } from '@/utils/classNames';

import styles from './SidebarContent.module.css';

const MAX_BADGE_COUNT = 9;

const SIDEBAR_LABELS = {
  navTitle: 'القائمة الرئيسية',
  navLandmark: 'القائمة الرئيسية',
  unread: (count: number) => `${count} غير مقروءة`,
  soon: 'قريباً',
} as const;

export interface SidebarContentProps {
  navItems: readonly NavItemConfig[];
  user?: ShellUser | undefined;
  headerActions?: ReactNode;
  footer?: ReactNode;
  /** Called after a nav link is activated (closes the mobile drawer). */
  onNavigate?: () => void;
}

export function SidebarContent({
  navItems,
  user,
  headerActions,
  footer,
  onNavigate,
}: SidebarContentProps) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.brandRow}>
        <BrandMark />
        {headerActions ? <div className={styles.headerActions}>{headerActions}</div> : null}
      </div>

      {user ? (
        <div className={styles.user}>
          <Avatar name={user.name} />
          <div className={styles.userText}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>
              <span className={styles.onlineDot} aria-hidden="true" />
              {user.roleLabel}
            </span>
          </div>
        </div>
      ) : null}

      <nav className={styles.nav} aria-label={SIDEBAR_LABELS.navLandmark}>
        <p className={styles.navTitle} aria-hidden="true">
          {SIDEBAR_LABELS.navTitle}
        </p>
        <ul className={styles.navList}>
          {navItems.map((item) =>
            isNavLinkItem(item) ? (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end ?? false}
                  className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
                  onClick={onNavigate}
                >
                  <span className={styles.navIcon}>
                    <item.icon aria-hidden="true" />
                    {item.badgeCount ? (
                      <span className={styles.navBadge}>
                        <span aria-hidden="true">
                          {item.badgeCount > MAX_BADGE_COUNT
                            ? `${MAX_BADGE_COUNT}+`
                            : item.badgeCount}
                        </span>
                        <span className="visually-hidden">
                          {SIDEBAR_LABELS.unread(item.badgeCount)}
                        </span>
                      </span>
                    ) : null}
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ) : (
              <li key={item.label}>
                <span
                  className={cx(styles.navLink, styles.navLinkUnavailable)}
                  aria-disabled="true"
                >
                  <span className={styles.navIcon}>
                    <item.icon aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                  <span className={styles.soonBadge}>{SIDEBAR_LABELS.soon}</span>
                </span>
              </li>
            ),
          )}
        </ul>
      </nav>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
