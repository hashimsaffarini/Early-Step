import type { HTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  hasDot?: boolean;
}

export function Badge({
  tone = 'neutral',
  hasDot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone], className)} {...rest}>
      {hasDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
