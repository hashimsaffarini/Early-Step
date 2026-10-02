import type { ActivityCategory } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import { getCategoryGradientClass } from './categoryGradient';
import styles from './CategoryTile.module.css';

export interface CategoryTileProps {
  category: ActivityCategory | 'neutral';
  /** Decorative emoji (hidden from assistive technology — the label carries the meaning). */
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'round';
  className?: string | undefined;
}

/** Gradient square/circle with an emoji — Replit's category tile. Decorative. */
export function CategoryTile({
  category,
  emoji,
  size = 'md',
  shape = 'square',
  className,
}: CategoryTileProps) {
  return (
    <span
      className={cx(
        styles.tile,
        styles[size],
        shape === 'round' && styles.round,
        getCategoryGradientClass(category),
        className,
      )}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}
