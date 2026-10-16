import { BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PlanSummary } from '@/components/shared/PlanSummary';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import type { PlanActivity } from '@/services/api/childPlan';

import { PlanActivityList } from './PlanActivityList';
import styles from './plans.module.css';

export interface PlanSectionProps {
  activities: readonly PlanActivity[];
  action?: ReactNode;
  emptyText: string;
  onRemove?: ((activity: PlanActivity) => void) | undefined;
  /** The plan's server progress %, when the endpoint sends it. */
  progress?: number | null | undefined;
  resultChildId?: string | undefined;
  playTo?: ((activity: PlanActivity) => string) | undefined;
}

/** A training plan: activity summary, completion % and the activities with their results. */
export function PlanSection({
  activities,
  action,
  emptyText,
  onRemove,
  progress,
  resultChildId,
  playTo,
}: PlanSectionProps) {
  return (
    <Card as="section" className={styles.card} aria-labelledby="plan-activities-title">
      <div className={styles.toolbar}>
        <SectionHeader
          id="plan-activities-title"
          title="أنشطة الخطة التدريبية"
          icon={BookOpen}
          iconTone="violet"
        />
        {action}
      </div>
      {activities.length === 0 ? (
        <EmptyState
          isBoxed={false}
          icon={<BookOpen />}
          title="لا توجد أنشطة في الخطة بعد"
          description={emptyText}
        />
      ) : (
        <>
          <PlanSummary activities={activities} serverProgress={progress} />
          <PlanActivityList
            activities={activities}
            onRemove={onRemove}
            resultChildId={resultChildId}
            playTo={playTo}
          />
        </>
      )}
    </Card>
  );
}
