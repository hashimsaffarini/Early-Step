import type { LucideIcon } from 'lucide-react';

import { cx } from '@/utils/classNames';

import styles from './StatPill.module.css';

export interface StatPillProps {
  icon?: LucideIcon;
  /** Full text, e.g. "النقاط: 3" — keep the meaning in words, not only in the icon. */
  children: string;
  tone?: 'neutral' | 'accent' | 'success' | 'primary';
}

/** Small counter pill (score, moves, time) in player headers. */
export function StatPill({ icon: Icon, children, tone = 'neutral' }: StatPillProps) {
  return (
    <span className={cx(styles.pill, tone !== 'neutral' && styles[tone])}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
