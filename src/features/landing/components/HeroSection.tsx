import { ArrowLeft, ChevronDown, CircleCheck } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName } from '@/components/ui/Button';
import { ROUTE_PATHS } from '@/constants/routes';
import { cx } from '@/utils/classNames';

import { LANDING_COPY } from '../content';

import { HeroVisual } from './HeroVisual';
import styles from './HeroSection.module.css';

const { hero } = LANDING_COPY;

export interface HeroSectionProps {
  /** Id of the section the "discover more" hint scrolls to. */
  nextSectionId: string;
}

export function HeroSection({ nextSectionId }: HeroSectionProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.grid}>
        <div className={styles.text}>
          <h1 id="hero-title" className={styles.title}>
            {hero.titleLine1}
            <br />
            {hero.titleLine2Start}{' '}
            <span className={styles.noWrap}>
              {hero.titleConjunction}
              <span className={styles.highlight}>
                <span className={styles.titleText}>{hero.titleHighlight}</span>
              </span>
            </span>{' '}
            {hero.titleLine2End}
          </h1>
          <p className={styles.description}>{hero.description}</p>
          <ul className={styles.features}>
            {hero.features.map((feature) => (
              <li key={feature} className={styles.feature}>
                <CircleCheck aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <div className={styles.ctas}>
            <Link
              to={ROUTE_PATHS.register}
              className={cx(getButtonClassName({ size: 'lg' }), styles.primaryCta)}
            >
              {hero.primaryCta}
              <ArrowLeft aria-hidden="true" />
            </Link>
            <Link
              to={ROUTE_PATHS.login}
              className={getButtonClassName({ variant: 'outline', size: 'lg' })}
            >
              {hero.secondaryCta}
            </Link>
          </div>
        </div>
        <HeroVisual />
      </div>
      <a href={`#${nextSectionId}`} className={styles.scrollHint}>
        {hero.scrollHint}
        <ChevronDown aria-hidden="true" />
      </a>
    </section>
  );
}
