import type { PlanActivity } from './childPlan';

/**
 * Training-plan summary derived from the real plan activities (client revision 2026-10). Every
 * figure comes from the server's rows; nothing is invented:
 * - total / completed / remaining — counts of the plan rows and their `isCompleted`.
 * - progress — the plan's server `progress` % when the endpoint sends it (Specialist plan),
 *   otherwise completed × 100 / total (e.g. 2 of 4 → 50 %, all → 100 %).
 * - correct / wrong answers — sums over completed activities that carry the counts; null when no
 *   row has them (the Parent's plan rows do not), so no 0 is shown for missing data.
 * - average score — the mean of `score` over completed activities that have one (each score is the
 *   server's % of correct answers for that activity); null when none has a score.
 */
export interface PlanSummaryFigures {
  total: number;
  completed: number;
  remaining: number;
  /** 0–100, rounded; null for an empty plan. */
  progress: number | null;
  correctAnswers: number | null;
  wrongAnswers: number | null;
  averageScore: number | null;
}

function sumOf(values: readonly (number | null)[]): number | null {
  const known = values.filter((value) => value !== null);
  return known.length === 0 ? null : known.reduce((total, value) => total + value, 0);
}

export function summarizePlan(
  activities: readonly PlanActivity[],
  serverProgress: number | null = null,
): PlanSummaryFigures {
  const total = activities.length;
  const done = activities.filter((activity) => activity.isCompleted);
  const scores = done.map((activity) => activity.score).filter((score) => score !== null);
  let progress: number | null = null;
  if (serverProgress !== null) progress = Math.round(serverProgress);
  else if (total > 0) progress = Math.round((done.length * 100) / total);
  return {
    total,
    completed: done.length,
    remaining: total - done.length,
    progress,
    correctAnswers: sumOf(done.map((activity) => activity.correctAnswers)),
    wrongAnswers: sumOf(done.map((activity) => activity.wrongAnswers)),
    averageScore:
      scores.length === 0
        ? null
        : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  };
}
