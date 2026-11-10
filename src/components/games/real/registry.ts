import { Brain, Crosshair, Route, Shapes, TrainFront } from 'lucide-react';

import {
  REAL_GAME_SLUGS,
  type Difficulty,
  type RealGameDefinition,
  type RealGameSlug,
} from './types';

/**
 * The five real Early Step games (client revision 2026-11). Product metadata only: no student
 * data, no backend activities. Each game's levels live in `content/`.
 */
export const REAL_GAMES: Readonly<Record<RealGameSlug, RealGameDefinition>> = {
  'memory-pairs': {
    slug: 'memory-pairs',
    name: 'لعبة الذاكرة',
    tagline: 'اكتشاف الأزواج المتطابقة',
    skill: 'الذاكرة والانتباه',
    instruction: 'اكتشف البطاقات المتطابقة!',
    emoji: '🃏',
    icon: Brain,
  },
  'sort-and-match': {
    slug: 'sort-and-match',
    name: 'رتّب وطابق',
    tagline: 'سحب العناصر إلى المكان الصحيح',
    skill: 'التصنيف والمطابقة',
    instruction: 'ضع كل صورة في مكانها الصحيح!',
    emoji: '🧺',
    icon: Shapes,
  },
  'target-catch': {
    slug: 'target-catch',
    name: 'اصطد الهدف',
    tagline: 'العثور على الهدف أثناء الحركة',
    skill: 'التركيز والتمييز البصري',
    instruction: 'اصطد البالونات التي عليها الهدف!',
    emoji: '🎈',
    icon: Crosshair,
  },
  'sequence-train': {
    slug: 'sequence-train',
    name: 'قطار الترتيب',
    tagline: 'ترتيب العناصر بالتسلسل الصحيح',
    skill: 'التسلسل والترتيب',
    instruction: 'حمّل عربات القطار بالترتيب الصحيح!',
    emoji: '🚂',
    icon: TrainFront,
  },
  'learning-maze': {
    slug: 'learning-maze',
    name: 'متاهة التعلم',
    tagline: 'الوصول إلى الهدف الصحيح',
    skill: 'التخطيط وحل المشكلات',
    instruction: 'أوصل السلحفاة إلى الهدف الصحيح!',
    emoji: '🐢',
    icon: Route,
  },
};

export const REAL_GAME_LIST: readonly RealGameDefinition[] = REAL_GAME_SLUGS.map(
  (slug) => REAL_GAMES[slug],
);

/** The default real game when a game activity carries no usable template (see GAME_ENGINE.md). */
export const DEFAULT_REAL_GAME: RealGameSlug = 'memory-pairs';

/**
 * The real game of a saved activity `slug`: the slug itself (`memory-pairs`) or with a suffix
 * (`memory-pairs-2`). Unknown or missing → null.
 */
export function resolveRealGame(slug: string | null | undefined): RealGameDefinition | null {
  const value = slug?.trim().toLowerCase();
  if (!value) return null;
  const match = REAL_GAME_SLUGS.find((key) => value === key || value.startsWith(`${key}-`));
  return match ? REAL_GAMES[match] : null;
}

/** A sensible starting difficulty from the child's age (2–10); the child can still change it. */
export function difficultyForAge(age: number | null | undefined): Difficulty {
  if (age === null || age === undefined) return 'easy';
  if (age <= 4) return 'easy';
  if (age <= 7) return 'medium';
  return 'hard';
}
