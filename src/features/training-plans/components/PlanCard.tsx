import { BookOpen, CalendarCheck, CalendarDays, Lightbulb, Target, UserRound } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';
import { cx } from '@/utils/classNames';
import { formatDisplayDate } from '@/utils/dateFormat';

import { PLAN_STATUS_DISPLAY } from '../labels';
import type { EducationPlan } from '../types';

import styles from './PlanCard.module.css';

function formatProgress(completed: number, total: number): string {
  return `${completed.toString()} من ${total.toString()} أنشطة`;
}

/** Replit IEP plan card: status, goals (violet), strategies (amber), meta chips, notes. */
export function PlanCard({ plan }: { plan: EducationPlan }) {
  const status = PLAN_STATUS_DISPLAY[plan.status];
  const headingId = `plan-${plan.id}-title`;

  return (
    <Card as="article" className={styles.card} aria-labelledby={headingId}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.icon} aria-hidden="true">
            <BookOpen />
          </span>
          <div>
            <h2 id={headingId} className={styles.title}>
              {plan.title}
            </h2>
            <p className={styles.subtitle}>
              تاريخ البدء:{' '}
              <time dateTime={plan.startedAt}>{formatDisplayDate(plan.startedAt)}</time>
            </p>
          </div>
        </div>
        <Badge tone={status.tone}>
          <status.icon aria-hidden="true" size={14} />
          {status.label}
        </Badge>
      </div>

      <div className={styles.sections}>
        <section className={cx(styles.section, styles.goals)} aria-label="الأهداف">
          <h3 className={styles.sectionTitle}>
            <Target aria-hidden="true" />
            الأهداف
          </h3>
          <ul className={styles.items}>
            {plan.goals.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
        </section>

        <section className={cx(styles.section, styles.strategies)} aria-label="الاستراتيجيات">
          <h3 className={styles.sectionTitle}>
            <Lightbulb aria-hidden="true" />
            الاستراتيجيات
          </h3>
          <ul className={styles.items}>
            {plan.strategies.map((strategy) => (
              <li key={strategy}>{strategy}</li>
            ))}
          </ul>
        </section>
      </div>

      <ul className={styles.chips} aria-label="تفاصيل الخطة">
        {plan.specialistName ? (
          <li className={styles.chip}>
            <UserRound aria-hidden="true" />
            الأخصائي: {plan.specialistName}
          </li>
        ) : null}
        <li className={styles.chip}>
          <CalendarDays aria-hidden="true" />
          البدء: {formatDisplayDate(plan.startedAt)}
        </li>
        {plan.reviewDate ? (
          <li className={styles.chip}>
            <CalendarCheck aria-hidden="true" />
            المراجعة: {formatDisplayDate(plan.reviewDate)}
          </li>
        ) : null}
        {plan.isLocal ? <li className={styles.chip}>مضافة محلياً — غير محفوظة</li> : null}
      </ul>

      {plan.activitiesTotal > 0 ? (
        <ProgressBar
          label="أنشطة الخطة المنجزة"
          value={plan.activitiesCompleted}
          max={plan.activitiesTotal}
          valueText={formatProgress(plan.activitiesCompleted, plan.activitiesTotal)}
          showLabel
        />
      ) : (
        <p className={styles.muted}>لم تُضف أنشطة إلى هذه الخطة بعد.</p>
      )}

      {plan.notes ? <p className={styles.notes}>{plan.notes}</p> : null}
    </Card>
  );
}
