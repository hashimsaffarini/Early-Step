import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './IconButton.module.css';

type IconButtonVariant = 'ghost' | 'muted' | 'outline' | 'primary' | 'danger';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'children'
> {
  /** Arabic accessible name — required because the button has no visible text. */
  label: string;
  icon: LucideIcon;
  variant?: IconButtonVariant;
}

export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.iconButton, variant !== 'ghost' && styles[variant], className)}
      {...rest}
    >
      <Icon className={styles.icon} aria-hidden="true" />
    </button>
  );
}
