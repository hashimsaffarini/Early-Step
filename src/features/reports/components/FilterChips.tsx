import { cx } from '@/utils/classNames';

import styles from './FilterChips.module.css';

export interface FilterChipOption<TValue extends string> {
  value: TValue;
  label: string;
  count: number;
}

export interface FilterChipsProps<TValue extends string> {
  label: string;
  options: readonly FilterChipOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

/** Single-choice filter chips (toggle buttons with counts). */
export function FilterChips<TValue extends string>({
  label,
  options,
  value,
  onChange,
}: FilterChipsProps<TValue>) {
  return (
    <div className={styles.chips} role="group" aria-label={label}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={cx(styles.chip, isActive && styles.active)}
            aria-pressed={isActive}
            onClick={() => {
              onChange(option.value);
            }}
          >
            {option.label}
            <span className={styles.count}>{option.count}</span>
          </button>
        );
      })}
    </div>
  );
}
