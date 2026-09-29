import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import styles from './SectionHeader.module.css';

export interface SectionHeaderProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  iconTone?: 'primary' | 'accent' | 'success' | 'violet';
  action?: ReactNode;
}

/** Section title with Replit's tinted icon tile and an optional action at the inline-end. */
export function SectionHeader({
  id,
  title,
  icon: Icon,
  iconTone = 'primary',
  action,
}: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.titleGroup}>
        {Icon ? (
          <span className={cx(styles.icon, styles[iconTone])} aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
