import { ChevronDown } from 'lucide-react';
import type { Ref, SelectHTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './controls.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

export function Select({ className, children, ...rest }: SelectProps) {
  return (
    <div className={styles.selectWrapper}>
      <select className={cx(styles.control, styles.select, className)} {...rest}>
        {children}
      </select>
      <span className={styles.selectArrow} aria-hidden="true">
        <ChevronDown />
      </span>
    </div>
  );
}
