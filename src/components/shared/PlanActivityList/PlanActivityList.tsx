import { ChevronLeft, CircleCheck, Clock, Gamepad2, ListChecks, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { ServerImage } from '@/components/shared/ServerImage';
import { Button, getButtonClassName } from '@/components/ui/Button';
import type { PlanActivity } from '@/services/api/childPlan';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './PlanActivityList.module.css';

const TYPE_LABEL = { test: 'اختبار', game: 'لعبة' } as const;

export interface PlanActivityListProps {
  activities: readonly PlanActivity[];
  /**
   * Specialist only: remove an activity (by its catalogue `activityId`). Completed activities
   * keep their results and cannot be removed (product rule, 2026-10-14).
   */
  onRemove?: ((activity: PlanActivity) => void) | undefined;
  /** Extra content under a completed activity (the specialist's answer details). */
  renderDetails?: ((activity: PlanActivity) => ReactNode) | undefined;
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

/**
 * Activities of a child's training plan as dashboard cards (shared by the Parent, Teacher and
 * Specialist pages): only the server's fields, status always as icon + text.
 */
export function PlanActivityList({
  activities,
  onRemove,
  renderDetails,
  playTo,
}: PlanActivityListProps) {
  return (
    <ul className={styles.list} aria-label="أنشطة الخطة التدريبية">
      {activities.map((activity) => {
        const result = resultFigures(activity);
        const dates = datesLine(activity);
        const title = activity.title || 'نشاط';
        const details = activity.isCompleted ? renderDetails?.(activity) : null;
        return (
          <li key={activity.id} className={cx(styles.item, activity.isCompleted && styles.done)}>
            <span
              className={cx(styles.icon, activity.type === 'game' && styles.iconGame)}
              aria-hidden="true"
            >
              <ServerImage
                path={activity.iconUrl}
                alt=""
                className={styles.iconImage}
                fallback={activity.type === 'game' ? <Gamepad2 /> : <ListChecks />}
              />
            </span>
            <div className={styles.text}>
              <h3 className={styles.title}>{title}</h3>
              <div className={styles.chips}>
                {activity.type ? (
                  <span className={styles.typeChip}>{TYPE_LABEL[activity.type]}</span>
                ) : null}
                {activity.isCompleted ? (
                  <span className={cx(styles.status, styles.statusDone)}>
                    <CircleCheck aria-hidden="true" />
                    مكتمل
                  </span>
                ) : (
                  <span className={styles.status}>
                    <Clock aria-hidden="true" />
                    لم يكتمل بعد
                  </span>
                )}
              </div>
              {activity.description ? (
                <p className={styles.description}>{activity.description}</p>
              ) : null}
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
            <div className={styles.actions}>
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
            </div>
            {details ? <div className={styles.details}>{details}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}
