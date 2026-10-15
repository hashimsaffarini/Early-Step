import { Trophy } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import type { ActivityCategory } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import styles from './ResultPanel.module.css';
import { StarRating } from './StarRating';

export interface ResultPanelProps {
  category: ActivityCategory | 'neutral';
  /** Encouraging headline, e.g. "ممتاز! 🌟". */
  title: string;
  /** Neutral result line, e.g. "7 من 8 إجابات صحيحة" (no percentages or clinical claims). */
  scoreText: string;
  /** Omitted when there is no real score to rate (e.g. a saved plan activity). */
  stars?: number | undefined;
  maxStars?: number;
  children?: ReactNode;
  /** Buttons/links below the panel (play again, back to catalogue). */
  actions: ReactNode;
}

/**
 * End-of-activity celebration (Replit result panel): trophy, headline, score line, stars.
 * Focus moves to the headline so screen-reader users hear the result.
 */
export function ResultPanel({
  category,
  title,
  scoreText,
  stars,
  maxStars = 5,
  children,
  actions,
}: ResultPanelProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className={styles.result} aria-labelledby="result-title">
      <div className={cx(styles.panel, getCategoryGradientClass(category))}>
        <Trophy className={styles.trophy} aria-hidden="true" />
        <h2 id="result-title" className={styles.title} ref={headingRef} tabIndex={-1}>
          {title}
        </h2>
        <p className={styles.score}>{scoreText}</p>
        {stars === undefined ? null : <StarRating value={stars} max={maxStars} size="lg" onDark />}
        {children ? <div className={styles.extra}>{children}</div> : null}
      </div>
      <div className={styles.actions}>{actions}</div>
    </section>
  );
}
