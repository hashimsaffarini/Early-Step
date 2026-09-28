import type { InputHTMLAttributes, ReactNode, Ref } from 'react';

import { cx } from '@/utils/classNames';

import styles from './controls.module.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
  label: ReactNode;
}

/** Native checkbox wrapped in its label, so the whole row is clickable and labelled. */
export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={cx(styles.checkboxLabel, className)}>
      <input type="checkbox" className={styles.checkbox} {...rest} />
      <span>{label}</span>
    </label>
  );
}
