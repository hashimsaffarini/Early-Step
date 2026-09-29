import heroImage from '@/assets/images/hero-landing.jpg';
import { cx } from '@/utils/classNames';

import { HIGHLIGHT_CARDS, LANDING_COPY, type HighlightCard } from '../content';

import styles from './HeroVisual.module.css';

const HERO_IMAGE_WIDTH = 1280;
const HERO_IMAGE_HEIGHT = 896;

const CARD_POSITION: Record<HighlightCard['id'], string | undefined> = {
  play: styles.play,
  'follow-up': styles.followUp,
  children: styles.children,
};

/** Framed hero illustration with three floating highlight cards (Replit layout). */
export function HeroVisual() {
  return (
    <div className={styles.visual}>
      <div className={styles.frame}>
        <img
          src={heroImage}
          alt={LANDING_COPY.hero.imageAlt}
          width={HERO_IMAGE_WIDTH}
          height={HERO_IMAGE_HEIGHT}
          className={styles.image}
          fetchPriority="high"
        />
      </div>
      <ul className={styles.cards}>
        {HIGHLIGHT_CARDS.map((card) => (
          <li key={card.id} className={cx(styles.card, CARD_POSITION[card.id])}>
            <span className={cx(styles.cardIcon, styles[card.tone])} aria-hidden="true">
              <card.icon />
            </span>
            <span>
              <span className={styles.cardTitle}>{card.title}</span>
              <br />
              <span className={styles.cardSubtitle}>{card.subtitle}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
