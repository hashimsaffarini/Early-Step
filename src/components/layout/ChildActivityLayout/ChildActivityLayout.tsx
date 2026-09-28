import type { ReactNode } from 'react';
import { Outlet } from 'react-router';

import styles from './ChildActivityLayout.module.css';

export interface ChildActivityLayoutProps {
  /** Minimal top bar content (exit button, title, progress). */
  topBar?: ReactNode;
}

/**
 * Focused, distraction-free shell for child-facing assessments and activities.
 * No sidebar or app navigation.
 */
export function ChildActivityLayout({ topBar }: ChildActivityLayoutProps) {
  return (
    <div className={styles.page}>
      {topBar ? <header className={styles.topBar}>{topBar}</header> : null}
      <main className={styles.main}>
        <div className={styles.stage}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
