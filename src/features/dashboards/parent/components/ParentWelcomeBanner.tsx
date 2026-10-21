import { Sprout, Zap } from 'lucide-react';

import { PageBanner } from '@/components/shared/PageBanner';

import { formatTodayLong } from '@/utils/dateFormat';

import { getGreeting } from '../format';

import styles from './ParentWelcomeBanner.module.css';

const SUBTITLE = 'إليك نظرة عامة على آخر التطورات والأنشطة.';

export interface ParentWelcomeBannerProps {
  parentName: string;
  now?: Date;
}

/**
 * Replit dashboard banner: date chip, greeting, parent name, subtitle and a decorative icon
 * (client revision 2026-10: no Early Step logo in the Parent area).
 */
export function ParentWelcomeBanner({ parentName, now = new Date() }: ParentWelcomeBannerProps) {
  return (
    <PageBanner
      tone="brand"
      eyebrow={
        <span className={styles.date}>
          <Zap aria-hidden="true" />
          <time dateTime={now.toISOString().slice(0, 10)}>{formatTodayLong(now)}</time>
        </span>
      }
      overline={getGreeting(now)}
      title={parentName}
      subtitle={SUBTITLE}
      aside={
        <span className={styles.illustration} aria-hidden="true">
          <Sprout />
        </span>
      }
    />
  );
}
