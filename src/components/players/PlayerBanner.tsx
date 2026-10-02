import type { ReactNode } from 'react';

import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import type { ActivityCategory } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import styles from './PlayerBanner.module.css';

export interface PlayerBannerProps {
  category: ActivityCategory | 'neutral';
  emoji: string;
  title: string;
  description?: string | undefined;
  /** Small pill at the inline-end (e.g. difficulty). */
  badge?: ReactNode;
}

/** Category gradient banner shown above a game/test card (Replit player banner). */
export function PlayerBanner({ category, emoji, title, description, badge }: PlayerBannerProps) {
  return (
    <section className={cx(styles.banner, getCategoryGradientClass(category))}>
      <span className={styles.emoji} aria-hidden="true">
        {emoji}
      </span>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {badge ? <span className={styles.badge}>{badge}</span> : null}
    </section>
  );
}
