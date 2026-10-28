import { CircleCheck, Clock, Eye, Gamepad2, ListChecks, Trash2 } from 'lucide-react';
import { Fragment, useState } from 'react';
import { Link } from 'react-router';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { PlanActivityListProps } from './PlanActivityList';
import styles from './PlanActivityTable.module.css';

type Filter = 'all' | 'test' | 'game' | 'completed';
const FILTERS: readonly { value: Filter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'test', label: 'الاختبارات' },
  { value: 'game', label: 'الألعاب' },
  { value: 'completed', label: 'المكتملة' },
];

/** Activity history with real scores and dates; filters never change the saved plan. */
export function PlanActivityTable({
  activities,
  playTo,
  onRemove,
  renderDetails,
  onSelectResult,
}: PlanActivityListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = activities.filter(
    (activity) =>
      filter === 'all' ||
      (filter === 'completed' ? activity.isCompleted : activity.type === filter),
  );
  return (
    <div className={styles.root}>
      <div className={styles.filters} role="group" aria-label="تصفية سجل الأنشطة">
        {FILTERS.map((item) => (
          <Button
            key={item.value}
            variant={filter === item.value ? 'primary' : 'ghost'}
            size="sm"
            aria-pressed={filter === item.value}
            onClick={() => {
              setFilter(item.value);
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className={styles.scroll} tabIndex={0} role="region" aria-label="سجل الأنشطة">
        <table className={styles.table}>
          <caption className={styles.caption}>أنشطة الخطة التدريبية</caption>
          <thead>
            <tr>
              <th scope="col">النشاط</th>
              <th scope="col">النوع</th>
              <th scope="col">الحالة</th>
              <th scope="col">النتيجة / الإجابات الصحيحة</th>
              <th scope="col">تاريخ الإكمال</th>
              <th scope="col">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((activity) => (
              <Fragment key={activity.id}>
                <tr>
                  <th scope="row">
                    <span className={styles.activity}>
                      {activity.type === 'game' ? (
                        <Gamepad2 aria-hidden="true" />
                      ) : (
                        <ListChecks aria-hidden="true" />
                      )}
                      {activity.title || 'نشاط'}
                    </span>
                  </th>
                  <td>
                    {activity.type ? (
                      <Badge tone={activity.type === 'game' ? 'accent' : 'primary'}>
                        {activity.type === 'game' ? 'لعبة' : 'اختبار'}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <Badge tone={activity.isCompleted ? 'success' : 'warning'}>
                      {activity.isCompleted ? (
                        <CircleCheck aria-hidden="true" />
                      ) : (
                        <Clock aria-hidden="true" />
                      )}
                      {activity.isCompleted ? 'مكتمل' : 'لم يكتمل بعد'}
                    </Badge>
                  </td>
                  <td>
                    <bdi>{activity.score === null ? '—' : `${activity.score.toString()}%`}</bdi>
                    {activity.correctAnswers !== null ? (
                      <span
                        className={styles.meta}
                      >{`${activity.correctAnswers.toString()} إجابات صحيحة`}</span>
                    ) : null}
                  </td>
                  <td>{activity.completedAt ? formatDisplayDate(activity.completedAt) : '—'}</td>
                  <td>
                    <div className={styles.actions}>
                      {playTo && !activity.isCompleted ? (
                        <Link
                          to={playTo(activity)}
                          className={getButtonClassName({ size: 'sm' })}
                          aria-label={`ابدأ: ${activity.title}`}
                        >
                          متابعة
                        </Link>
                      ) : null}
                      {onRemove && !activity.isCompleted ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconStart={<Trash2 aria-hidden="true" />}
                          aria-label={`إزالة «${activity.title}» من الخطة`}
                          onClick={() => {
                            onRemove(activity);
                          }}
                        >
                          إزالة
                        </Button>
                      ) : null}
                      {activity.isCompleted && onSelectResult ? (
                        <Button
                          size="sm"
                          variant="soft"
                          iconStart={<Eye aria-hidden="true" />}
                          onClick={() => {
                            onSelectResult(activity);
                          }}
                        >
                          عرض إجابات الطفل
                        </Button>
                      ) : null}
                      {activity.isCompleted && renderDetails && !onSelectResult ? (
                        <span className={styles.answerIcon} aria-hidden="true">
                          <Eye />
                        </span>
                      ) : null}
                    </div>
                  </td>
                </tr>
                {activity.isCompleted && renderDetails && !onSelectResult ? (
                  <tr>
                    <td colSpan={6} className={styles.details}>
                      {renderDetails(activity)}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className={styles.empty}>لا توجد أنشطة مطابقة للتصفية.</p>
        ) : null}
      </div>
    </div>
  );
}
