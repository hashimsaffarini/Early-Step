import { ClipboardList, FolderTree, ListChecks } from 'lucide-react';
import { NavLink } from 'react-router';

import { ADMIN_PATHS } from '@/constants/routes';
import { cx } from '@/utils/classNames';

import styles from './content.module.css';

const LINKS = [
  { to: ADMIN_PATHS.categories, label: 'التصنيفات', icon: FolderTree },
  { to: ADMIN_PATHS.activities, label: 'الأنشطة والأسئلة', icon: ListChecks },
  { to: ADMIN_PATHS.initialAssessment, label: 'التقييم المبدئي', icon: ClipboardList },
] as const;

/** Sub-navigation shared by the admin content pages. */
export function ContentNav() {
  return (
    <nav className={styles.nav} aria-label="أقسام إدارة المحتوى">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => cx(styles.navLink, isActive && styles.navLinkActive)}
        >
          <link.icon aria-hidden="true" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
