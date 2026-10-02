import {
  ChevronLeft,
  CircleCheck,
  ClipboardList,
  Gamepad2,
  Hourglass,
  Plus,
  Target,
} from 'lucide-react';
import { Link } from 'react-router';

import { CategoryTile } from '@/components/shared/CategoryTile';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_CATEGORY_DISPLAY } from '@/constants/activityCategories';
import { useRoleArea } from '@/hooks/useRoleArea';

import type { PlanActivity, PlanActivityType } from '@/features/children/types';

import { ASSIGN_ACTIVITY_LABEL, formatActivityCount } from './labels';
import styles from './profile.module.css';

const GROUPS: readonly { type: PlanActivityType; title: string; empty: string; play: string }[] = [
  { type: 'game', title: 'الألعاب المُعيَّنة', empty: 'لا توجد ألعاب مُعيَّنة بعد', play: 'العب' },
  {
    type: 'test',
    title: 'الاختبارات المُعيَّنة',
    empty: 'لا توجد اختبارات مُعيَّنة بعد',
    play: 'ابدأ',
  },
];

function ActivityRow({ activity, playLabel }: { activity: PlanActivity; playLabel: string }) {
  const { paths } = useRoleArea();
  const playPath =
    activity.type === 'game'
      ? paths.gamePlay(activity.activityId)
      : paths.testPlay(activity.activityId);
  return (
    <li className={styles.row}>
      <CategoryTile category={activity.category} emoji={activity.emoji} size="sm" />
      <div className={styles.rowBody}>
        <p className={styles.rowTitle}>{activity.title}</p>
        <p className={styles.muted}>{ACTIVITY_CATEGORY_DISPLAY[activity.category].label}</p>
      </div>
      <div className={styles.rowActions}>
        {activity.isCompleted ? (
          <Badge tone="success">
            <CircleCheck aria-hidden="true" size={14} />
            مكتمل
          </Badge>
        ) : (
          <Badge>
            <Hourglass aria-hidden="true" size={14} />
            لم يكتمل بعد
          </Badge>
        )}
        <Link
          to={playPath}
          className={styles.playLink}
          aria-label={`${playLabel}: ${activity.title}`}
        >
          {playLabel}
          <ChevronLeft aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

export interface ActivitiesTabProps {
  /** Plan activities plus anything assigned locally in this session. */
  activities: readonly PlanActivity[];
  hasPlan: boolean;
  /** Staff only: opens the assign-activity dialog. */
  onAssign?: (() => void) | undefined;
}

/** Replit "الأنشطة" tab: assigned games and tests with "العب" links to the players. */
export function ActivitiesTab({ activities, hasPlan, onAssign }: ActivitiesTabProps) {
  const assignButton = onAssign ? (
    <button type="button" className={styles.assignCta} onClick={onAssign}>
      <Plus aria-hidden="true" />
      {ASSIGN_ACTIVITY_LABEL}
    </button>
  ) : undefined;

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={<Target />}
        title={hasPlan ? 'لا توجد أنشطة بعد' : 'لا توجد خطة تدريبية بعد'}
        description={
          onAssign
            ? 'اضغط «تعيين نشاط جديد» لإضافة ألعاب أو اختبارات.'
            : 'ستظهر هنا الأنشطة بعد أن يُعدّ الأخصائي الخطة التدريبية.'
        }
        action={assignButton}
      />
    );
  }

  return (
    <div className={styles.column}>
      {assignButton ? <div className={styles.actionBar}>{assignButton}</div> : null}
      <div className={styles.twoColumns}>
        {GROUPS.map((group) => {
          const items = activities.filter((activity) => activity.type === group.type);
          const headingId = `profile-activities-${group.type}`;
          return (
            <Card as="section" key={group.type} className={styles.card} aria-labelledby={headingId}>
              <SectionHeader
                id={headingId}
                title={group.title}
                icon={group.type === 'game' ? Gamepad2 : ClipboardList}
                iconTone={group.type === 'game' ? 'violet' : 'primary'}
                action={<Badge tone="neutral">{formatActivityCount(items.length)}</Badge>}
              />
              {items.length > 0 ? (
                <ul className={styles.list}>
                  {items.map((activity) => (
                    <ActivityRow key={activity.id} activity={activity} playLabel={group.play} />
                  ))}
                </ul>
              ) : (
                <EmptyState isBoxed={false} title={group.empty} />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
