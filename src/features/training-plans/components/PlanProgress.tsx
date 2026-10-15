import { ProgressBar } from '@/components/ui/Feedback';
import type { PlanActivity } from '@/services/api/childPlan';

export interface PlanProgressProps {
  activities: readonly PlanActivity[];
  /** The plan's server-computed % (`progress`), when sent. */
  progress?: number | null | undefined;
}

/** Progress = the server's `progress` %, or completed / assigned activities. */
export function PlanProgress({ activities, progress = null }: PlanProgressProps) {
  const total = activities.length;
  if (total === 0) return null;
  const completed = activities.filter((activity) => activity.isCompleted).length;
  return (
    <ProgressBar
      label="الأنشطة المنجزة"
      value={progress ?? (completed * 100) / total}
      max={100}
      showLabel
      tone="success"
      valueText={`${completed} من ${total} أنشطة`}
    />
  );
}
