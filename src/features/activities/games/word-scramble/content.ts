import type { BuildRound } from '@/features/activities/games/shared/useBuildRounds';

/** TEMPORARY UI DEMO CONTENT — short words split into letters. */
export interface ScrambleRound extends BuildRound {
  word: string;
  emoji: string;
  hint: string;
}

function scrambleRound(word: string, emoji: string, hint: string): ScrambleRound {
  const letters = Array.from(word);
  return { word, emoji, hint, tokens: letters, accepted: [letters] };
}

export const SCRAMBLE_ROUNDS: readonly ScrambleRound[] = [
  scrambleRound('قطة', '🐱', 'حيوان أليف يموء'),
  scrambleRound('شمس', '☀️', 'تضيء النهار'),
  scrambleRound('قلم', '✏️', 'نكتب به'),
  scrambleRound('بيت', '🏠', 'نسكن فيه'),
  scrambleRound('كتاب', '📚', 'نقرأ منه'),
  scrambleRound('سمكة', '🐟', 'تسبح في الماء'),
];
