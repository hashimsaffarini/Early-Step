import type { ActivityCategory, ActivityDifficulty } from '@/constants/activityCategories';

export type ActivityKind = 'test' | 'game';

/** What a catalogue card needs — built from the test or game definitions. */
export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  emoji: string;
  difficulty: ActivityDifficulty;
  /** Extra meta chips, e.g. "4 أسئلة", "~4 د". */
  meta: readonly string[];
  playTo: string;
}

export type CategoryFilterValue = ActivityCategory | 'all';

/** Categories shown in the catalogue filters (Replit's six; attention is assessment-only). */
export const CATALOG_CATEGORIES = [
  'memory',
  'reading',
  'math',
  'writing',
  'logic',
  'listening',
] as const satisfies readonly ActivityCategory[];

interface CountWords {
  one: string;
  two: string;
  few: string;
  many: string;
}

const WORDS: Record<ActivityKind, CountWords> = {
  test: { one: 'اختبار واحد', two: 'اختباران', few: 'اختبارات', many: 'اختباراً' },
  game: { one: 'لعبة واحدة', two: 'لعبتان', few: 'ألعاب', many: 'لعبة' },
};

const FEW_MAX = 10;

/** Arabic count phrase: "لعبة واحدة", "لعبتان", "3 ألعاب", "11 لعبة". */
export function formatActivityCount(count: number, kind: ActivityKind): string {
  const words = WORDS[kind];
  if (count === 1) return words.one;
  if (count === 2) return words.two;
  if (count >= 3 && count <= FEW_MAX) return `${count.toString()} ${words.few}`;
  return `${count.toString()} ${words.many}`;
}
