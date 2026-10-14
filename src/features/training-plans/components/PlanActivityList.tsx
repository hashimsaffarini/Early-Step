import { CircleCheck, Clock, Gamepad2, ListChecks, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { PlanActivity } from '@/services/api/childPlan';
import { formatDisplayDate } from '@/utils/dateFormat';

import { PlanActivityResultDetails } from './PlanActivityResultDetails';
import styles from './plans.module.css';

const TYPE_LABEL = { test: 'اختبار', game: 'لعبة' } as const;

export interface PlanActivityListProps {
  activities: readonly PlanActivity[];
  /** Specialist only: remove an activity (by its catalogue `activityId`). */
  onRemove?: ((activity: PlanActivity) => void) | undefined;
  /** Specialist only: lets completed activities open the child's answers. */
  resultChildId?: string | undefined;
}

function resultLine(activity: PlanActivity): string | null {
  const parts: string[] = [];
  if (activity.score !== null) parts.push(`النتيجة: ${activity.score.toString()}%`);
  if (activity.correctAnswers !== null) parts.push(`إجابات صحيحة: ${activity.correctAnswers}`);
  if (activity.wrongAnswers !== null) parts.push(`إجابات غير صحيحة: ${activity.wrongAnswers}`);
  if (activity.completedAt) parts.push(`أُكمل في ${formatDisplayDate(activity.completedAt)}`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Activities of a child's training plan — only the server's fields, status in words + icon. */
export function PlanActivityList({ activities, onRemove, resultChildId }: PlanActivityListProps) {
  return (
    <ul className={styles.list} aria-label="أنشطة الخطة التدريبية">
      {activities.map((activity) => {
        const result = resultLine(activity);
        const title = activity.title || 'نشاط';
        return (
          <li key={activity.id} className={styles.item}>
            <span className={styles.itemIcon} aria-hidden="true">
              {activity.type === 'game' ? <Gamepad2 /> : <ListChecks />}
            </span>
            <div className={styles.itemText}>
              <h3 className={styles.itemTitle}>{title}</h3>
              {activity.description ? (
                <p className={styles.itemDescription}>{activity.description}</p>
              ) : null}
              <div className={styles.badges}>
                {activity.type ? <Badge tone="primary">{TYPE_LABEL[activity.type]}</Badge> : null}
                {activity.isCompleted ? (
                  <Badge tone="success">
                    <CircleCheck aria-hidden="true" size={14} />
                    مكتمل
                  </Badge>
                ) : (
                  <Badge tone="neutral">
                    <Clock aria-hidden="true" size={14} />
                    لم يكتمل بعد
                  </Badge>
                )}
              </div>
              {result ? <p className={styles.meta}>{result}</p> : null}
            </div>
            {onRemove ? (
              <Button
                variant="ghost"
                size="sm"
                iconStart={<Trash2 aria-hidden="true" />}
                aria-label={`إزالة «${title}» من الخطة`}
                onClick={() => {
                  onRemove(activity);
                }}
              >
                إزالة
              </Button>
            ) : null}
            {resultChildId && activity.isCompleted ? (
              <PlanActivityResultDetails
                childId={resultChildId}
                planActivityId={activity.id}
                title={title}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
