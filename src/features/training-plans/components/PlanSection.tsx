import { BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PlanActivityTable } from '@/components/shared/PlanActivityList';
import { PlanSummary } from '@/components/shared/PlanSummary';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import type { PlanActivity } from '@/services/api/childPlan';

import { PlanActivityResultDetails } from './PlanActivityResultDetails';
import styles from './plans.module.css';

export interface PlanSectionProps {
  activities: readonly PlanActivity[];
  onSelectResult?: ((activity: PlanActivity) => void) | undefined;
  action?: ReactNode;
  emptyText: string;
  onRemove?: ((activity: PlanActivity) => void) | undefined;
  /** The plan's server progress %, when the endpoint sends it. */
  progress?: number | null | undefined;
  resultChildId?: string | undefined;
  playTo?: ((activity: PlanActivity) => string) | undefined;
  /** False on the child dashboards, where the header and stat cards already show the summary. */
  showSummary?: boolean;
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
  onSelectResult,
  showSummary = true,
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
          {showSummary ? <PlanSummary activities={activities} serverProgress={progress} /> : null}
          <PlanActivityTable
            activities={activities}
            onRemove={onRemove}
            playTo={playTo}
            onSelectResult={onSelectResult}
            renderDetails={
              resultChildId
                ? (activity) => (
                    <PlanActivityResultDetails
                      childId={resultChildId}
                      planActivityId={activity.id}
                      title={activity.title || 'نشاط'}
                    />
                  )
                : undefined
            }
          />
        </>
      )}
    </Card>
  );
}
