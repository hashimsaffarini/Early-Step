import type { GameResult } from '@/features/activities/games/types';

const GREAT_RATIO = 0.8;
const GOOD_RATIO = 0.5;

/** Encouraging headline — never judgemental, never a percentage. */
export function getResultTitle({ correct, total }: GameResult): string {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= GREAT_RATIO) return 'ممتاز! 🌟';
  if (ratio >= GOOD_RATIO) return 'أحسنت! 👍';
  return 'محاولة رائعة! 💪';
}

export function getResultSummary(result: GameResult): string {
  return (
    result.summary ?? `${result.correct.toString()} من ${result.total.toString()} إجابات صحيحة`
  );
}
