import { ChevronLeft, CircleCheck, Clock, Gamepad2, ListChecks, Trash2 } from 'lucide-react';
import { Link } from 'react-router';

import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { Button, getButtonClassName } from '@/components/ui/Button';
import type { PlanActivity } from '@/services/api/childPlan';
import { formatDisplayDate } from '@/utils/dateFormat';

import { PlanActivityResultDetails } from './PlanActivityResultDetails';
import styles from './plans.module.css';

const TYPE_LABEL = { test: 'اختبار', game: 'لعبة' } as const;

export interface PlanActivityListProps {
  activities: readonly PlanActivity[];
  /**
   * Specialist only: remove an activity (by its catalogue `activityId`). Completed activities
   * keep their results and cannot be removed (product rule, 2026-10-14).
   */
  onRemove?: ((activity: PlanActivity) => void) | undefined;
  /** Specialist only: lets completed activities open the child's answers. */
  resultChildId?: string | undefined;
  /** Parent / Teacher: link to play an activity that is not completed yet. */
  playTo?: ((activity: PlanActivity) => string) | undefined;
}

/** The saved result, only with the fields the server sent (never a placeholder 0). */
function resultFigures(activity: PlanActivity): { label: string; value: string }[] {
  const figures: { label: string; value: string }[] = [];
  if (activity.score !== null)
    figures.push({ label: 'النتيجة', value: `${activity.score.toString()}%` });
  if (activity.correctAnswers !== null) {
    figures.push({ label: 'الصحيحة', value: activity.correctAnswers.toString() });
  }
  if (activity.wrongAnswers !== null) {
    figures.push({ label: 'الخاطئة', value: activity.wrongAnswers.toString() });
  }
  return figures;
}

function datesLine(activity: PlanActivity): string | null {
  const parts: string[] = [];
  if (activity.assignedAt) parts.push(`أُسند في ${formatDisplayDate(activity.assignedAt)}`);
  if (activity.completedAt) parts.push(`أُكمل في ${formatDisplayDate(activity.completedAt)}`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

/** Activities of a child's training plan — only the server's fields, status in words + icon. */
export function PlanActivityList({
  activities,
  onRemove,
  resultChildId,
  playTo,
}: PlanActivityListProps) {
  return (
    <ul className={styles.list} aria-label="أنشطة الخطة التدريبية">
      {activities.map((activity) => {
        const result = resultFigures(activity);
        const dates = datesLine(activity);
        const title = activity.title || 'نشاط';
        return (
          <li key={activity.id} className={styles.item}>
            <span className={styles.itemIcon} aria-hidden="true">
              <ServerImage
                path={activity.iconUrl}
                alt=""
                className={styles.itemIconImage}
                fallback={activity.type === 'game' ? <Gamepad2 /> : <ListChecks />}
              />
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
              {result.length > 0 ? (
                <ul className={styles.resultChips} aria-label={`نتيجة «${title}»`}>
                  {result.map((figure) => (
                    <li key={figure.label} className={styles.resultChip}>
                      {figure.label}
                      <bdi className={styles.resultValue}>{figure.value}</bdi>
                    </li>
                  ))}
                </ul>
              ) : null}
              {dates ? <p className={styles.meta}>{dates}</p> : null}
            </div>
            {playTo && !activity.isCompleted ? (
              <Link
                to={playTo(activity)}
                className={getButtonClassName({ size: 'sm' })}
                aria-label={`ابدأ: ${title}`}
              >
                ابدأ
                <ChevronLeft aria-hidden="true" />
              </Link>
            ) : null}
            {onRemove && !activity.isCompleted ? (
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
