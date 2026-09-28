import type { LucideIcon } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import styles from './StatCard.module.css';

export type StatCardTone = 'primary' | 'success' | 'warning' | 'danger';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatCardTone;
}

/** Dashboard metric. Only real values — never placeholder or fabricated numbers. */
export function StatCard({ label, value, icon: Icon, tone = 'primary' }: StatCardProps) {
  return (
    <Card padding="compact" className={styles.stat}>
      <span className={cx(styles.icon, styles[tone])} aria-hidden="true">
        <Icon />
      </span>
      <div>
        <p className={styles.label}>{label}</p>
        <p className={styles.value}>{value}</p>
      </div>
    </Card>
  );
}
