import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

import { cx } from '@/utils/classNames';

import styles from './controls.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  ref?: Ref<HTMLInputElement>;
  /** Decorative icon shown at the inline-start edge. */
  leadingIcon?: ReactNode;
  /** Interactive element (e.g. a toggle button) at the inline-end edge. */
  trailing?: ReactNode;
  inputSize?: 'md' | 'lg';
}

export function Input({ leadingIcon, trailing, inputSize = 'md', className, ...rest }: InputProps) {
  const input = (
    <input
      className={cx(styles.control, inputSize === 'lg' && styles.large, className)}
      {...rest}
    />
  );

  if (!leadingIcon && !trailing) return input;

  return (
    <div
      className={cx(
        leadingIcon ? styles.withIcon : undefined,
        trailing ? styles.withTrailing : undefined,
      )}
    >
      {leadingIcon ? (
        <span className={styles.leadingIcon} aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {input}
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </div>
  );
}
