import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import styles from './Feedback.module.css';

type AlertTone = 'danger' | 'success' | 'info' | 'warning';

const TONES: Record<AlertTone, { className: string | undefined; icon: LucideIcon }> = {
  danger: { className: styles.alertDanger, icon: CircleAlert },
  success: { className: styles.alertSuccess, icon: CircleCheck },
  info: { className: styles.alertInfo, icon: Info },
  warning: { className: styles.alertWarning, icon: TriangleAlert },
};

export interface AlertProps {
  tone?: AlertTone;
  children: ReactNode;
}

/** Inline message. Icon + text so meaning never relies on colour alone. */
export function Alert({ tone = 'info', children }: AlertProps) {
  const { className, icon: Icon } = TONES[tone];
  return (
    <div className={cx(styles.alert, className)} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
