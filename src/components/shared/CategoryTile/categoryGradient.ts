import type { ActivityCategory } from '@/constants/activityCategories';

import styles from './categoryTones.module.css';

/** Class that paints the category gradient (white text stays ≥ 4.5:1). */
export function getCategoryGradientClass(category: ActivityCategory | 'neutral'): string {
  return styles[category] ?? styles.neutral ?? '';
}
