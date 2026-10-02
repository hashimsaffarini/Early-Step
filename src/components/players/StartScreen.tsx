import { Play } from 'lucide-react';

import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import { Card } from '@/components/ui/Card';
import type { ActivityCategory } from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import { PlayerBanner, type PlayerBannerProps } from './PlayerBanner';
import styles from './StartScreen.module.css';

export interface StartScreenProps extends PlayerBannerProps {
  category: ActivityCategory | 'neutral';
  /** Short, simple steps read before playing (adults can read them aloud). */
  instructions: readonly string[];
  startLabel?: string;
  onStart: () => void;
}

/** Banner + "كيف ألعب؟" steps + big gradient start button (Replit start screen). */
export function StartScreen({
  instructions,
  startLabel = 'ابدأ اللعبة',
  onStart,
  ...banner
}: StartScreenProps) {
  return (
    <>
      <PlayerBanner {...banner} />
      <Card className={styles.card}>
        <h2 className={styles.heading}>كيف ألعب؟</h2>
        <ol className={styles.steps}>
          {instructions.map((step) => (
            <li key={step} className={styles.step}>
              {step}
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={cx(styles.start, getCategoryGradientClass(banner.category))}
          onClick={onStart}
        >
          <Play aria-hidden="true" />
          {startLabel}
        </button>
      </Card>
    </>
  );
}
