import { ClipboardCheck, Clock, FileText, Target, UserPlus, type LucideIcon } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildEvent, ChildEventKind } from '@/features/children/types';

import styles from './profile.module.css';

const HEADING_ID = 'profile-events-title';

const EVENT_DISPLAY: Record<ChildEventKind, { icon: LucideIcon; tone: string | undefined }> = {
  profile: { icon: UserPlus, tone: styles.tonePrimary },
  assessment: { icon: ClipboardCheck, tone: styles.toneSuccess },
  plan: { icon: Target, tone: styles.toneWarning },
  report: { icon: FileText, tone: styles.toneViolet },
};

export function RecentEventsCard({ events }: { events: readonly ChildEvent[] }) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="آخر النشاطات" icon={Clock} iconTone="accent" />
      {events.length > 0 ? (
        <ol className={styles.list}>
          {events.map((event) => {
            const display = EVENT_DISPLAY[event.kind];
            return (
              <li key={event.id} className={styles.row}>
                <span className={cx(styles.iconTile, display.tone)} aria-hidden="true">
                  <display.icon />
                </span>
                <div className={styles.rowBody}>
                  <p className={styles.rowTitle}>{event.title}</p>
                  <time className={styles.muted} dateTime={event.date}>
                    {formatDisplayDate(event.date)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState isBoxed={false} icon={<Clock />} title="لا توجد نشاطات بعد" />
      )}
    </Card>
  );
}
