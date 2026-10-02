import type { BuildRound } from '@/features/activities/games/shared/useBuildRounds';

/** TEMPORARY UI DEMO CONTENT — short sentences (both common Arabic word orders are accepted). */
export interface SentenceRound extends BuildRound {
  emoji: string;
}

export const SENTENCE_ROUNDS: readonly SentenceRound[] = [
  {
    emoji: '🏫',
    tokens: ['الولد', 'يذهب', 'إلى', 'المدرسة'],
    accepted: [
      ['الولد', 'يذهب', 'إلى', 'المدرسة'],
      ['يذهب', 'الولد', 'إلى', 'المدرسة'],
    ],
  },
  {
    emoji: '📖',
    tokens: ['أحمد', 'يقرأ', 'الكتاب'],
    accepted: [
      ['أحمد', 'يقرأ', 'الكتاب'],
      ['يقرأ', 'أحمد', 'الكتاب'],
    ],
  },
  {
    emoji: '⚽',
    tokens: ['البنت', 'تلعب', 'بالكرة'],
    accepted: [
      ['البنت', 'تلعب', 'بالكرة'],
      ['تلعب', 'البنت', 'بالكرة'],
    ],
  },
  {
    emoji: '😸',
    tokens: ['القطة', 'تنام', 'على', 'السرير'],
    accepted: [
      ['القطة', 'تنام', 'على', 'السرير'],
      ['تنام', 'القطة', 'على', 'السرير'],
    ],
  },
  {
    emoji: '☀️',
    tokens: ['الطقس', 'جميل', 'اليوم'],
    accepted: [
      ['الطقس', 'جميل', 'اليوم'],
      ['الطقس', 'اليوم', 'جميل'],
      ['اليوم', 'الطقس', 'جميل'],
    ],
  },
];
