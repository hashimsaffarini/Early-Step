import { cx } from '@/utils/classNames';

import styles from './Button.module.css';

export const BUTTON_VARIANTS = ['primary', 'accent', 'outline', 'soft', 'ghost', 'danger'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleOptions {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  fullWidth?: boolean | undefined;
}

/** Shared class builder so links (e.g. router `<Link>`) can look like buttons. */
export function getButtonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return cx(
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    fullWidth && styles.fullWidth,
  );
}

export const buttonSpinnerClassName = styles.spinner;
