import { ChevronLeft, CircleCheck, ClipboardList, Gamepad2, Hourglass, Target } from 'lucide-react';
import { Link } from 'react-router';

import { CategoryTile } from '@/components/shared/CategoryTile';
import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { AreaRole } from '@/constants/routes';
import { useChildPlanActivities } from '@/hooks/api/childResources';
import { ServerImage } from '@/components/shared/ServerImage';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ActivityType } from '@/services/api/activityType';
import type { PlanActivity } from '@/services/api/childPlan';

import { formatActivityCount } from './labels';
import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

const GROUPS: readonly {
  type: ActivityType;
  title: string;
  empty: string;
  emptyHint?: string;
  emoji: string;
}[] = [
  {
    type: 'test',
    title: 'الاختبارات المُعيَّنة',
    empty: 'لا توجد اختبارات مُعيَّنة بعد',
    emoji: '📝',
  },
  {
    type: 'game',
    title: 'الألعاب المُعيَّنة',
    empty: 'لا توجد ألعاب مُعيَّنة بعد',
    // Live 2026-10-16: the backend has no game activities yet; games reach a child only through
    // the training plan (no demo games are shown).
    emptyHint: 'تظهر الألعاب هنا عندما يضيف الأخصائي لعبة إلى الخطة التدريبية.',
    emoji: '🎮',
  },
];

/** Children play plan activities with the parent at home or the teacher in class. */
const CAN_PLAY: Record<AreaRole, boolean> = {
  Parent: true,
  Teacher: true,
  Specialist: false,
  Admin: false,
};

function ActivityRow({
  activity,
  childId,
  emoji,
  canPlay,
}: {
  activity: PlanActivity;
  childId: string;
  emoji: string;
  canPlay: boolean;
}) {
  const { paths } = useRoleArea();
  // Only the counts the server sent — a missing one is not shown as 0.
  const counts = [
    activity.correctAnswers === null ? null : `إجابات صحيحة: ${activity.correctAnswers.toString()}`,
    activity.wrongAnswers === null ? null : `غير صحيحة: ${activity.wrongAnswers.toString()}`,
  ].filter((part) => part !== null);
  return (
    <li className={styles.row}>
      <ServerImage
        path={activity.iconUrl}
        alt=""
        className={styles.activityIcon}
        fallback={<CategoryTile category="neutral" emoji={emoji} size="sm" />}
      />
      <div className={styles.rowBody}>
        <p className={styles.rowTitle}>{activity.title}</p>
        {counts.length > 0 ? <p className={styles.muted}>{counts.join(' · ')}</p> : null}
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
        {canPlay ? (
          <Link
            to={paths.planActivityPlay(childId, activity.activityId)}
            className={styles.playLink}
            aria-label={`ابدأ: ${activity.title}`}
          >
            ابدأ
            <ChevronLeft aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}

export interface ActivitiesTabProps {
  childId: string;
  role: AreaRole;
}

/**
 * Plan activities (`GET TrainingPlan/children/{id}/activities`). Plan management lives on the
 * training-plans page (`paths.childPlans`) — linked here for the specialist.
 */
export function ActivitiesTab({ childId, role }: ActivitiesTabProps) {
  const { paths } = useRoleArea();
  const query = useChildPlanActivities(childId);
  const managePlan =
    role === 'Specialist' ? (
      <Link to={paths.childPlans(childId)} className={getButtonClassName({ variant: 'soft' })}>
        إدارة الخطة التدريبية
      </Link>
    ) : undefined;

  const status = <QueryStatus query={query} errorTitle="تعذّر تحميل أنشطة الخطة" />;
  if (query.isPending || query.isError) return status;

  if (query.data.length === 0) {
    return (
      <EmptyState
        icon={<Target />}
        title="لا توجد أنشطة في الخطة التدريبية بعد"
        description="ستظهر هنا الأنشطة بعد أن يضيفها الأخصائي إلى الخطة التدريبية."
        action={managePlan}
      />
    );
  }

  const others = query.data.filter((activity) => activity.type === null);
  return (
    <div className={styles.column}>
      {managePlan ? <div className={styles.actionBar}>{managePlan}</div> : null}
      <div className={styles.twoColumns}>
        {GROUPS.map((group) => {
          const items = [
            ...query.data.filter((activity) => activity.type === group.type),
            ...(group.type === 'test' ? others : []),
          ];
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
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      childId={childId}
                      emoji={group.emoji}
                      canPlay={CAN_PLAY[role]}
                    />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  isBoxed={false}
                  title={group.empty}
                  {...(group.emptyHint ? { description: group.emptyHint } : {})}
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
