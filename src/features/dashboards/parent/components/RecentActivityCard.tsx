import { ClipboardCheck, Clock, FileText, Target, type LucideIcon } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ActivityKind, ParentActivityItem } from '../types';

import styles from './RecentActivityCard.module.css';

const HEADING_ID = 'parent-activity-title';

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  assessment: ClipboardCheck,
  report: FileText,
  plan: Target,
};

export interface RecentActivityCardProps {
  items: readonly ParentActivityItem[];
}

export function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="آخر النشاطات" icon={Clock} iconTone="accent" />
      <ol className={styles.list}>
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind];
          return (
            <li key={item.id} className={styles.item}>
              <span className={cx(styles.icon, styles[item.kind])} aria-hidden="true">
                <Icon />
              </span>
              <div className={styles.body}>
                <p className={styles.title}>{item.title}</p>
                <p className={styles.description}>{item.description}</p>
                <time className={styles.date} dateTime={item.date}>
                  {formatDisplayDate(item.date)}
                </time>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
