import { ArrowRight, CircleCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import { APP_NAME } from '@/constants/app';
import { ROUTE_PATHS } from '@/constants/routes';

import styles from './AuthSplitShell.module.css';

const LABELS = {
  home: 'الصفحة الرئيسية',
  rights: 'جميع الحقوق محفوظة.',
} as const;

export interface AuthSplitShellProps {
  panelTitle: string;
  panelHighlight: string;
  panelText: string;
  panelPoints: readonly string[];
  backLink: { to: string; label: string };
  children: ReactNode;
}

/** Split layout used by the password-recovery screens (Replit forgot/reset design). */
export function AuthSplitShell({
  panelTitle,
  panelHighlight,
  panelText,
  panelPoints,
  backLink,
  children,
}: AuthSplitShellProps) {
  const year = new Date().getFullYear();

  return (
    <div className={styles.shell}>
      <aside className={styles.panel} aria-hidden="true">
        <Link to={ROUTE_PATHS.home} className={styles.homeLink} tabIndex={-1}>
          <BrandMark tone="onDark" />
        </Link>
        <div className={styles.panelCopy}>
          <p className={styles.panelTitle}>
            {panelTitle}
            <br />
            <span className={styles.highlight}>{panelHighlight}</span>
          </p>
          <p className={styles.panelText}>{panelText}</p>
          <ul className={styles.checklist}>
            {panelPoints.map((point) => (
              <li key={point}>
                <CircleCheck />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className={styles.copyright}>
          <bdi dir="ltr" lang="en">
            © {year} {APP_NAME}
          </bdi>
          . {LABELS.rights}
        </p>
      </aside>

      <main className={styles.content}>
        <div className={styles.topBar}>
          <Link to={ROUTE_PATHS.home} className={styles.mobileBrand} aria-label={LABELS.home}>
            <BrandMark />
          </Link>
          <Link to={backLink.to} className={styles.backLink}>
            <ArrowRight aria-hidden="true" />
            {backLink.label}
          </Link>
        </div>
        <div className={styles.main}>
          <div className={styles.formArea}>{children}</div>
        </div>
      </main>
    </div>
  );
}
