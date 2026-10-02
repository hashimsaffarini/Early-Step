import { ChevronLeft, Play, Star, UserPlus } from 'lucide-react';
import { Link } from 'react-router';

import { getCategoryGradientClass } from '@/components/shared/CategoryTile';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import {
  ACTIVITY_CATEGORY_DISPLAY,
  ACTIVITY_DIFFICULTIES,
  ACTIVITY_DIFFICULTY_DISPLAY,
} from '@/constants/activityCategories';
import { cx } from '@/utils/classNames';

import styles from './CatalogCard.module.css';
import type { CatalogItem } from './catalogTypes';

export interface CatalogCardProps {
  item: CatalogItem;
  playLabel: string;
  onAssign: (item: CatalogItem) => void;
}

const MAX_LEVEL = ACTIVITY_DIFFICULTIES.length;

/** Catalogue card (Replit): gradient header with emoji and difficulty, meta, play + assign. */
export function CatalogCard({ item, playLabel, onAssign }: CatalogCardProps) {
  const difficulty = ACTIVITY_DIFFICULTY_DISPLAY[item.difficulty];
  const level = ACTIVITY_DIFFICULTIES.indexOf(item.difficulty) + 1;

  return (
    <article className={styles.card}>
      <div className={cx(styles.header, getCategoryGradientClass(item.category))}>
        <div>
          {/* Decorative: the difficulty badge below carries the same information in text. */}
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: MAX_LEVEL }, (_, index) => (
              <Star key={index} className={cx(styles.star, index < level && styles.starFilled)} />
            ))}
          </div>
          <h3 className={styles.title}>{item.title}</h3>
        </div>
        <span className={styles.emoji} aria-hidden="true">
          {item.emoji}
        </span>
      </div>
      <div className={styles.body}>
        <p className={styles.description}>{item.description}</p>
        <ul className={styles.meta} aria-label="تفاصيل">
          <li>
            <Badge tone={difficulty.tone}>{`الصعوبة: ${difficulty.label}`}</Badge>
          </li>
          <li>
            <Badge>{ACTIVITY_CATEGORY_DISPLAY[item.category].label}</Badge>
          </li>
          {item.meta.map((entry) => (
            <li key={entry}>
              <Badge>{entry}</Badge>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Link
            to={item.playTo}
            className={cx(styles.play, getCategoryGradientClass(item.category))}
            aria-label={`${playLabel}: ${item.title}`}
          >
            <Play aria-hidden="true" />
            {playLabel}
            <ChevronLeft aria-hidden="true" />
          </Link>
          <IconButton
            label={`تعيين «${item.title}» لطفل`}
            icon={UserPlus}
            variant="outline"
            onClick={() => {
              onAssign(item);
            }}
          />
        </div>
      </div>
    </article>
  );
}
