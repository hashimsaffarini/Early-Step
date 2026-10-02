import { Star } from 'lucide-react';

import { cx } from '@/utils/classNames';

import styles from './StarRating.module.css';

export interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'md' | 'lg';
  /** Lighter colours for use on gradient panels. */
  onDark?: boolean;
}

/** Earned stars (game/test results). Announced as "3 من 5 نجوم". */
export function StarRating({ value, max = 5, size = 'md', onDark = false }: StarRatingProps) {
  const earned = Math.min(Math.max(Math.round(value), 0), max);
  return (
    <span
      className={cx(styles.stars, size === 'lg' && styles.lg, onDark && styles.onDark)}
      role="img"
      aria-label={`${earned} من ${max} نجوم`}
    >
      {Array.from({ length: max }, (_, index) => (
        <Star
          key={index}
          className={cx(styles.star, index < earned && styles.filled)}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
