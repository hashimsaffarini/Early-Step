import { Brain, Hash, ScanSearch, Type } from 'lucide-react';

import type { ChoiceQuestionType } from '@/components/players';

import { SpotIt } from './spot-it/SpotIt';
import { FocusChallenge } from './focus-challenge/FocusChallenge';
import { LetterHunt } from './letter-hunt/LetterHunt';
import { MemorySequence } from './memory-sequence/MemorySequence';
import { NumberMatch } from './number-match/NumberMatch';
import { GAME_SLUGS, type ChallengeProps, type GameSlug, type GameTemplate } from './types';

/**
 * The game engine registry (client revision 2026-10). Each template is frontend product code; the
 * activity, its questions, options and the saved result always come from the backend.
 */
export const GAME_TEMPLATES: Readonly<Record<GameSlug, GameTemplate>> = {
  'spot-it': {
    slug: 'spot-it',
    name: 'ابحث وجِد!',
    purpose: 'البحث البصري والتركيز',
    description: 'لوحة صور ورموز: يبحث الطفل عن العناصر المطلوبة ويختارها بالضغط عليها.',
    instruction: 'ابحث عن العناصر المطلوبة في اللوحة، ثم اضغط «التالي».',
    questionTypes: ['SingleChoice', 'MultiSelect'],
    icon: ScanSearch,
    tone: 'attention',
    Challenge: SpotIt,
  },
  'letter-hunt': {
    slug: 'letter-hunt',
    name: 'صيد الحروف',
    purpose: 'الحروف والقراءة',
    description: 'بطاقات حروف كبيرة ملوّنة: يختار الطفل الحرف أو الكلمة المطلوبة.',
    instruction: 'اصطد الإجابة: اضغط على البطاقة الصحيحة.',
    questionTypes: ['SingleChoice'],
    icon: Type,
    tone: 'reading',
    Challenge: LetterHunt,
  },
  'number-match': {
    slug: 'number-match',
    name: 'طابق الرقم',
    purpose: 'الأرقام والحساب',
    description: 'بطاقات أرقام كبيرة: يطابق الطفل السؤال بالرقم الصحيح.',
    instruction: 'اختر الرقم الذي يطابق السؤال.',
    questionTypes: ['SingleChoice'],
    icon: Hash,
    tone: 'math',
    Challenge: NumberMatch,
  },
  'memory-sequence': {
    slug: 'memory-sequence',
    name: 'تحدي الذاكرة',
    purpose: 'الذاكرة والتسلسل',
    description: 'يرتّب الطفل البطاقات بالضغط عليها بالترتيب، مع تراجع وإعادة.',
    instruction: 'اضغط على البطاقات بالترتيب الصحيح.',
    questionTypes: ['Sequence'],
    icon: Brain,
    tone: 'memory',
    Challenge: MemorySequence,
  },
  'focus-challenge': {
    slug: 'focus-challenge',
    name: 'تحدي التركيز',
    purpose: 'التركيز والانتباه',
    description: 'شبكة بطاقات: يختار الطفل كل البطاقات المطلوبة ثم يتابع.',
    instruction: 'اختر كل البطاقات المطلوبة، ثم اضغط «التالي».',
    questionTypes: ['MultiSelect'],
    icon: ScanSearch,
    tone: 'attention',
    Challenge: FocusChallenge,
  },
};

export const GAME_TEMPLATE_LIST: readonly GameTemplate[] = GAME_SLUGS.map(
  (slug) => GAME_TEMPLATES[slug],
);

/**
 * The template of a game activity from its backend `slug` (`POST/PUT Admin/activities/game`
 * `Slug`). A slug is either the template slug itself (`letter-hunt`) or the template slug followed
 * by `-` and a suffix (`letter-hunt-2`), so several games can share a template. Unknown or missing
 * slugs → null (the generic activity player is used).
 */
export function resolveGameTemplate(slug: string | null | undefined): GameTemplate | null {
  const value = slug?.trim().toLowerCase();
  if (!value) return null;
  const match = GAME_SLUGS.find((key) => value === key || value.startsWith(`${key}-`));
  return match ? GAME_TEMPLATES[match] : null;
}

/** The slug saved for a game: the template slug, plus an optional suffix (`letter-hunt-2`). */
export function buildGameSlug(template: GameSlug, suffix: string): string {
  const clean = suffix.trim().toLowerCase();
  return clean ? `${template}-${clean}` : template;
}

/** The suffix part of a saved slug for a template (`letter-hunt-2` → `2`). */
export function gameSlugSuffix(slug: string, template: GameSlug): string {
  return slug.startsWith(`${template}-`) ? slug.slice(template.length + 1) : '';
}

const ENGINE_BY_TYPE: Record<ChoiceQuestionType, GameSlug> = {
  SingleChoice: 'letter-hunt',
  Sequence: 'memory-sequence',
  MultiSelect: 'focus-challenge',
};

/**
 * The engine for one question: the template's own engine when the question type fits it,
 * otherwise the engine made for that type — so every real question stays answerable (the server
 * saves a result only when every question is answered). Questions are never rewritten.
 */
export function engineFor(template: GameTemplate, type: ChoiceQuestionType): GameSlug {
  return template.questionTypes.includes(type) ? template.slug : ENGINE_BY_TYPE[type];
}

export type { ChallengeProps };
