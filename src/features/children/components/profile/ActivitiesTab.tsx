import { CircleCheck, ClipboardList, Gamepad2, Hourglass, Target } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

import type { ChildTrainingPlan, PlanActivity, PlanActivityType } from '@/features/children/types';

import styles from './profile.module.css';

const GROUPS: readonly { type: PlanActivityType; title: string; empty: string }[] = [
  { type: 'game', title: 'الألعاب المُعيَّنة', empty: 'لا توجد ألعاب مُعيَّنة بعد' },
  { type: 'test', title: 'الاختبارات المُعيَّنة', empty: 'لا توجد اختبارات مُعيَّنة بعد' },
];

function ActivityRow({ activity }: { activity: PlanActivity }) {
  const Icon = activity.type === 'game' ? Gamepad2 : ClipboardList;
  return (
    <li className={styles.row}>
      <span
        className={`${styles.iconTile} ${activity.type === 'game' ? styles.toneViolet : styles.tonePrimary}`}
        aria-hidden="true"
      >
        <Icon />
      </span>
      <div className={styles.rowBody}>
        <p className={styles.rowTitle}>{activity.title}</p>
        <p className={styles.muted}>{activity.category}</p>
      </div>
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
    </li>
  );
}

/** Replit "الأنشطة" tab: assigned games and tests (view only). */
export function ActivitiesTab({ plan }: { plan: ChildTrainingPlan | undefined }) {
  if (!plan) {
    return (
      <EmptyState
        icon={<Target />}
        title="لا توجد خطة تدريبية بعد"
        description="ستظهر هنا الأنشطة بعد أن يُعدّ الأخصائي الخطة التدريبية."
      />
    );
  }

  return (
    <div className={styles.twoColumns}>
      {GROUPS.map((group) => {
        const items = plan.activities.filter((activity) => activity.type === group.type);
        const headingId = `profile-activities-${group.type}`;
        return (
          <Card as="section" key={group.type} className={styles.card} aria-labelledby={headingId}>
            <SectionHeader
              id={headingId}
              title={group.title}
              icon={group.type === 'game' ? Gamepad2 : ClipboardList}
              iconTone={group.type === 'game' ? 'violet' : 'primary'}
            />
            {items.length > 0 ? (
              <ul className={styles.list}>
                {items.map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                ))}
              </ul>
            ) : (
              <EmptyState isBoxed={false} title={group.empty} />
            )}
          </Card>
        );
      })}
    </div>
  );
}
