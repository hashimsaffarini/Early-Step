import type { ReactNode } from 'react';

import { cx } from '@/utils/classNames';

import styles from './PageBanner.module.css';

export type PageBannerTone = 'brand' | 'violet' | 'teal' | 'sunset';

export interface PageBannerProps {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  /** Optional element at the inline-end (illustration, avatar, stats). */
  aside?: ReactNode;
  tone?: PageBannerTone;
  /** Heading level; dashboards use the banner as the page h1. */
  headingLevel?: 1 | 2;
}

/** Gradient hero banner (Replit visual language) with decorative bubbles. */
export function PageBanner({
  title,
  subtitle,
  eyebrow,
  actions,
  aside,
  tone = 'brand',
  headingLevel = 1,
}: PageBannerProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section className={cx(styles.banner, styles[tone])}>
      <div className={styles.content}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        <Heading className={styles.title}>{title}</Heading>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {aside}
    </section>
  );
}
