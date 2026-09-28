import type { ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import styles from './StatusMessage.module.css';

export interface StatusMessageProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  /** Render inside a dashed card (default) or bare (e.g. full-page states). */
  isBoxed?: boolean;
}

interface BaseProps extends StatusMessageProps {
  role?: 'status' | 'alert';
  variant: 'empty' | 'error' | 'loading';
}

/** Shared markup for loading / empty / error states. */
export function StatusMessage({
  title,
  description,
  action,
  icon,
  isBoxed = true,
  role,
  variant,
}: BaseProps) {
  return (
    <div
      className={cx(styles.status, isBoxed && styles.boxed, variant === 'error' && styles.error)}
      data-variant={variant}
      role={role}
    >
      {icon ? (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
