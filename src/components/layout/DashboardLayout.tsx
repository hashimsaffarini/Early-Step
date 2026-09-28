import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

interface DashboardLayoutProps {
  /** Role-specific navigation, supplied by the role's route module. */
  navigation?: ReactNode;
  header?: ReactNode;
}

/**
 * Structural shell for role dashboards: skip link, header, side navigation
 * (inline-start in RTL) and main content. Visual design is TBD.
 */
export function DashboardLayout({ navigation, header }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <a className="skip-link" href="#main-content">
        تخطَّ إلى المحتوى الرئيسي
      </a>
      {header ? <header className="dashboard-layout__header">{header}</header> : null}
      {navigation ? (
        <nav className="dashboard-layout__nav" aria-label="القائمة الرئيسية">
          {navigation}
        </nav>
      ) : null}
      <main id="main-content" className="dashboard-layout__main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
