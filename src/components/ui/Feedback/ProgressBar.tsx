import type { CSSProperties } from 'react';

import { cx } from '@/utils/classNames';

import styles from './Feedback.module.css';

const MAX_PERCENT = 100;

export interface ProgressBarProps {
  /** Current value, 0..max. */
  value: number;
  max?: number;
  label: string;
  /** Show the label and value text above the bar. */
  showLabel?: boolean;
  tone?: 'primary' | 'success' | 'accent';
}

const TONE_CLASS = {
  primary: undefined,
  success: styles.fillSuccess,
  accent: styles.fillAccent,
} as const;

export function ProgressBar({
  value,
  max = MAX_PERCENT,
  label,
  showLabel = false,
  tone = 'primary',
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? Math.round((clamped / max) * MAX_PERCENT) : 0;
  const fillStyle = { '--progress-value': `${percent}%` } as CSSProperties;

  return (
    <div className={styles.progress}>
      {showLabel ? (
        <div className={styles.progressLabelRow} aria-hidden="true">
          <span>{label}</span>
          <span dir="ltr">{percent}%</span>
        </div>
      ) : null}
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
      >
        <div className={cx(styles.fill, TONE_CLASS[tone])} style={fillStyle} />
      </div>
    </div>
  );
}
