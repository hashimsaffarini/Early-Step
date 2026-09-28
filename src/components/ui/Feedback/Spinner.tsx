import { cx } from '@/utils/classNames';

import styles from './Feedback.module.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label; omit when a visible loading text is already present. */
  label?: string;
}

const SIZE_CLASS = { sm: styles.spinnerSm, md: undefined, lg: styles.spinnerLg } as const;

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <span
      className={cx(styles.spinner, SIZE_CLASS[size])}
      {...(label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true })}
    />
  );
}
