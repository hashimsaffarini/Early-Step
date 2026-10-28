import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { useChildPlanActivities } from '@/hooks/api/childResources';
import type { PlanActivity } from '@/services/api/childPlan';

import { PlanSection } from './PlanSection';

export interface ChildPlanPanelProps {
  childId: string;
  onSelectResult?: ((activity: PlanActivity) => void) | undefined;
  /** Parent / Teacher: link to play an activity that is not completed yet. */
  playTo?: ((activity: PlanActivity) => string) | undefined;
  /** False on the child dashboards (the summary is shown there as stat cards). */
  showSummary?: boolean;
  /** Lets completed activities open the child's answers (shown only if the server allows it). */
  showAnswers?: boolean;
}

/**
 * Read-only training plan (Parent, Teacher) from `TrainingPlan/children/{id}/activities`: summary,
 * progress and every activity with the result fields the server sends for this role.
 */
export function ChildPlanPanel({
  childId,
  playTo,
  onSelectResult,
  showSummary = true,
  showAnswers = false,
}: ChildPlanPanelProps) {
  const plan = useChildPlanActivities(childId);
  if (plan.isPending) return <LoadingState label="جارٍ تحميل الخطة…" />;
  if (plan.error) {
    return (
      <ErrorState
        title="تعذّر تحميل الخطة التدريبية"
        description={plan.error.message}
        action={
          <Button variant="outline" onClick={() => void plan.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  }
  return (
    <PlanSection
      activities={plan.data}
      emptyText="يُضيف الأخصائي الأنشطة إلى الخطة بعد مراجعة التقييم المبدئي."
      playTo={playTo}
      onSelectResult={onSelectResult}
      showSummary={showSummary}
      resultChildId={showAnswers ? childId : undefined}
    />
  );
}
