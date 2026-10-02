import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import { ACTIVITY_CATEGORY_DISPLAY, ALL_CATEGORIES_DISPLAY } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import { CATALOG_CATEGORIES, type CategoryFilterValue } from './catalogTypes';
import styles from './CategoryFilter.module.css';

export interface CategoryFilterProps {
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
  /** Number of items per category (missing = 0). */
  counts: Partial<Record<CategoryFilterValue, number>>;
}

const OPTIONS: readonly CategoryFilterValue[] = ['all', ...CATALOG_CATEGORIES];

/** Category chips with counts (toggle buttons; horizontally scrollable on small screens). */
export function CategoryFilter({ value, onChange, counts }: CategoryFilterProps) {
  return (
    <div className={styles.filters} role="group" aria-label="تصفية حسب التصنيف">
      {OPTIONS.map((option) => {
        const display =
          option === 'all' ? ALL_CATEGORIES_DISPLAY : ACTIVITY_CATEGORY_DISPLAY[option];
        const isActive = option === value;
        const Icon = display.icon;
        return (
          <button
            key={option}
            type="button"
            className={cx(
              styles.chip,
              isActive && styles.active,
              isActive && getCategoryGradientClass(option === 'all' ? 'neutral' : option),
            )}
            aria-pressed={isActive}
            onClick={() => {
              onChange(option);
            }}
          >
            <Icon aria-hidden="true" />
            <span>{display.label}</span>
            <span className={styles.count}>{counts[option] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
