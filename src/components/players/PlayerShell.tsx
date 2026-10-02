import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { CategoryTile } from '@/components/shared/CategoryTile';
import type { ActivityCategory } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import styles from './PlayerShell.module.css';

export interface PlayerTopBarProps {
  /** Where "خروج" leads (the catalogue or profile the child came from). */
  exitTo: string;
  exitLabel?: string;
  title: string;
  category: ActivityCategory | 'neutral';
  emoji: string;
  /** Inline-end controls (sound toggle, score, timer). */
  end?: ReactNode;
}

export interface PlayerShellProps extends PlayerTopBarProps {
  children: ReactNode;
  /** Wider stage for grids that need room (e.g. assessment section picker). */
  width?: 'player' | 'wide';
}

/**
 * Full-screen, distraction-free page for games, tests and the initial assessment:
 * sticky top bar (exit · title · controls) over the light child canvas. The title is the page h1.
 */
export function PlayerShell({
  exitTo,
  exitLabel = 'خروج',
  title,
  category,
  emoji,
  end,
  children,
  width = 'player',
}: PlayerShellProps) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.topStart}>
          <Link to={exitTo} className={styles.exit}>
            <ArrowRight aria-hidden="true" />
            <span className={styles.exitLabel}>{exitLabel}</span>
          </Link>
        </div>
        <h1 className={styles.title}>
          <CategoryTile category={category} emoji={emoji} size="sm" />
          <span className={styles.titleText}>{title}</span>
        </h1>
        <div className={styles.topEnd}>{end}</div>
      </header>
      <main id="main-content" className={styles.main} tabIndex={-1}>
        <div className={cx(styles.stage, width === 'wide' && styles.wide)}>{children}</div>
      </main>
    </div>
  );
}
