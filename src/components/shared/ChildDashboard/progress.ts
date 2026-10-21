import type { PlanSummaryFigures } from '@/services/api/planSummary';

import type { ChildHeroProgress } from './ChildHero';

/** Progress for the hero only when the plan has activities (an empty plan shows no 0 %). */
export function childHeroProgress(summary: PlanSummaryFigures | null): ChildHeroProgress | null {
  if (!summary || summary.total === 0 || summary.progress === null) return null;
  return { percent: summary.progress, completed: summary.completed, total: summary.total };
}
