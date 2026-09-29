import { CalendarDays, Target, UserRound } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildTrainingPlan } from '@/features/children/types';

import { countCompleted, formatActivityProgress } from './labels';
import styles from './profile.module.css';

const HEADING_ID = 'profile-plan-title';

export interface PlanSummaryCardProps {
  plan: ChildTrainingPlan | undefined;
  onShowActivities: () => void;
}

export function PlanSummaryCard({ plan, onShowActivities }: PlanSummaryCardProps) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="الخطة التدريبية" icon={Target} iconTone="accent" />
      {plan ? (
        <>
          <p className={styles.lead}>{plan.title}</p>
          <ul className={styles.meta}>
            <li>
              <UserRound aria-hidden="true" />
              الأخصائي: {plan.specialistName}
            </li>
            <li>
              <CalendarDays aria-hidden="true" />
              تاريخ البدء: {formatDisplayDate(plan.startedAt)}
            </li>
          </ul>
          <ProgressBar
            label="أنشطة الخطة المنجزة"
            value={countCompleted(plan.activities)}
            max={plan.activities.length}
            valueText={formatActivityProgress(
              countCompleted(plan.activities),
              plan.activities.length,
            )}
            showLabel
          />
          <div className={styles.footer}>
            <Button variant="soft" onClick={onShowActivities}>
              عرض الأنشطة
            </Button>
          </div>
        </>
      ) : (
        <EmptyState
          isBoxed={false}
          icon={<Target />}
          title="لا توجد خطة تدريبية بعد"
          description="يُعدّ الأخصائي الخطة التدريبية بعد مراجعة التقييم المبدئي."
        />
      )}
    </Card>
  );
}
