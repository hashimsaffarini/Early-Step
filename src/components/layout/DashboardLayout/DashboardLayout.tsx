import { Menu } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import type { NavItemConfig, ShellUser } from '@/components/layout/navigation';
import { IconButton } from '@/components/ui/IconButton';

import styles from './DashboardLayout.module.css';
import { MobileNavDrawer } from './MobileNavDrawer';
import { SidebarContent } from './SidebarContent';

const LABELS = {
  skipLink: 'تخطَّ إلى المحتوى الرئيسي',
  openMenu: 'فتح القائمة',
} as const;

export interface DashboardLayoutProps {
  /** Role-specific navigation, supplied by the role's route module. */
  navItems: readonly NavItemConfig[];
  user?: ShellUser;
  /** Compact actions next to the brand (e.g. notifications). */
  headerActions?: ReactNode;
  /** Bottom of the sidebar (e.g. logout). */
  sidebarFooter?: ReactNode;
}

/**
 * App shell for role areas: sticky sidebar on the inline-start (right in RTL) from 64rem,
 * mobile header + drawer below that.
 */
export function DashboardLayout({
  navItems,
  user,
  headerActions,
  sidebarFooter,
}: DashboardLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerId = useId();
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        {LABELS.skipLink}
      </a>

      <aside className={styles.sidebar}>
        <SidebarContent
          navItems={navItems}
          user={user}
          headerActions={headerActions}
          footer={sidebarFooter}
        />
      </aside>

      <header className={styles.mobileHeader}>
        <BrandMark />
        <div className={styles.mobileHeaderActions}>
          {headerActions}
          <IconButton
            label={LABELS.openMenu}
            icon={Menu}
            variant="outline"
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            aria-controls={drawerId}
            onClick={() => {
              setIsDrawerOpen(true);
            }}
          />
        </div>
      </header>

      <MobileNavDrawer id={drawerId} isOpen={isDrawerOpen} onClose={closeDrawer}>
        <SidebarContent
          navItems={navItems}
          user={user}
          footer={sidebarFooter}
          onNavigate={closeDrawer}
        />
      </MobileNavDrawer>

      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
