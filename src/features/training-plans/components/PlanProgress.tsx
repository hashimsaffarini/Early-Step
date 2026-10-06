import { ProgressBar } from '@/components/ui/Feedback';
import type { PlanActivity } from '@/services/api/childPlan';

/** Progress = completed / assigned activities (both real server fields). */
export function PlanProgress({ activities }: { activities: readonly PlanActivity[] }) {
  const total = activities.length;
  if (total === 0) return null;
  const completed = activities.filter((activity) => activity.isCompleted).length;
  return (
    <ProgressBar
      label="الأنشطة المنجزة"
      value={completed}
      max={total}
      showLabel
      tone="success"
      valueText={`${completed} من ${total} أنشطة`}
    />
  );
}
