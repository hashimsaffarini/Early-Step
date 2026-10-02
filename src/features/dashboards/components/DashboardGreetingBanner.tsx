import { Zap } from 'lucide-react';
import type { ReactNode } from 'react';

import { PageBanner, type PageBannerTone } from '@/components/shared/PageBanner';
import { Avatar } from '@/components/ui/Avatar';
import { getGreeting } from '@/features/dashboards/parent/format';
import { formatTodayLong } from '@/utils/dateFormat';

import styles from './DashboardGreetingBanner.module.css';

export interface DashboardGreetingBannerProps {
  name: string;
  subtitle: string;
  tone?: PageBannerTone;
  /** Emoji appended to the greeting (e.g. 👋, 👑). Decorative. */
  greetingEmoji?: string;
  /** Show today's date chip above the greeting. */
  showDate?: boolean;
  /** Show the user's initial in a glass circle at the inline-end. */
  showAvatar?: boolean;
  actions?: ReactNode;
  now?: Date;
}

/** Role dashboard hero: optional date chip, time greeting, name (h1), subtitle, actions. */
export function DashboardGreetingBanner({
  name,
  subtitle,
  tone = 'brand',
  greetingEmoji,
  showDate = false,
  showAvatar = false,
  actions,
  now = new Date(),
}: DashboardGreetingBannerProps) {
  return (
    <PageBanner
      tone={tone}
      eyebrow={
        showDate ? (
          <span className={styles.date}>
            <Zap aria-hidden="true" />
            <time dateTime={now.toISOString().slice(0, 10)}>{formatTodayLong(now)}</time>
          </span>
        ) : undefined
      }
      overline={
        <>
          {getGreeting(now)}
          {greetingEmoji ? (
            <span className={styles.emoji} aria-hidden="true">
              {greetingEmoji}
            </span>
          ) : null}
        </>
      }
      title={name}
      subtitle={subtitle}
      actions={actions}
      aside={
        showAvatar ? (
          <span className={styles.avatarWrap}>
            <Avatar name={name} size="xl" shape="circle" className={styles.avatar} />
          </span>
        ) : undefined
      }
    />
  );
}
