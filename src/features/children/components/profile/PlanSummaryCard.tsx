import { Target } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Feedback';
import { useChildPlanActivities } from '@/hooks/api/childResources';

import { countCompleted, formatActivityProgress } from './labels';
import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

const HEADING_ID = 'profile-plan-title';

export interface PlanSummaryCardProps {
  childId: string;
  onShowActivities: () => void;
}

/**
 * Training plan progress from the plan activities (completed / total). The API has no plan
 * title, start date or specialist name on this endpoint, so none are shown.
 */
export function PlanSummaryCard({ childId, onShowActivities }: PlanSummaryCardProps) {
  const query = useChildPlanActivities(childId);
  let body;
  if (query.isPending || query.isError) {
    body = <QueryStatus query={query} errorTitle="تعذّر تحميل الخطة التدريبية" />;
  } else if (query.data.length === 0) {
    body = (
      <EmptyState
        isBoxed={false}
        icon={<Target />}
        title="لا توجد خطة تدريبية بعد"
        description="يُعدّ الأخصائي الخطة التدريبية بعد مراجعة التقييم المبدئي."
      />
    );
  } else {
    const completed = countCompleted(query.data);
    body = (
      <>
        <ProgressBar
          label="أنشطة الخطة المنجزة"
          value={completed}
          max={query.data.length}
          valueText={formatActivityProgress(completed, query.data.length)}
          showLabel
        />
        <div className={styles.footer}>
          <Button variant="soft" onClick={onShowActivities}>
            عرض الأنشطة
          </Button>
        </div>
      </>
    );
  }
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="الخطة التدريبية" icon={Target} iconTone="accent" />
      {body}
    </Card>
  );
}
