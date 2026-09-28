import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import {
  buttonSpinnerClassName,
  getButtonClassName,
  type ButtonStyleOptions,
} from './buttonStyles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleOptions {
  isLoading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  isLoading = false,
  iconStart,
  iconEnd,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(getButtonClassName({ variant, size, fullWidth }), className)}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? <span className={buttonSpinnerClassName} aria-hidden="true" /> : iconStart}
      {children}
      {!isLoading && iconEnd}
    </button>
  );
}
