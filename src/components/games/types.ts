import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';

import type { ChoiceQuestionType } from '@/components/players';

/** The Early Step game templates (frontend product code, not backend data). */
export const GAME_SLUGS = [
  'letter-hunt',
  'number-match',
  'memory-sequence',
  'focus-challenge',
  'spot-it',
] as const;
export type GameSlug = (typeof GAME_SLUGS)[number];

/** One real option of a backend question, as the engines need it. */
export interface GameOption {
  id: string;
  text: string;
  imageUrl: string | null;
}

/** One real backend question (from the Training Plan activity), as the engines need it. */
export interface GameQuestion {
  id: string;
  text: string;
  imageUrl: string | null;
  type: ChoiceQuestionType;
  options: readonly GameOption[];
}

/**
 * Props of one challenge (one question) of a game engine. The selection is the option ids in the
 * child's order; the runner turns it into the backend answer (`toChoiceAnswer`).
 */
export interface ChallengeProps {
  question: GameQuestion;
  selection: readonly string[];
  onSelectionChange: (next: string[]) => void;
  disabled?: boolean;
}

export type GameTone = 'reading' | 'math' | 'memory' | 'attention';

/** Product metadata of a game template — never student data or backend activities. */
export interface GameTemplate {
  slug: GameSlug;
  /** Arabic display name. */
  name: string;
  /** What the game trains (shown to the Admin and in the game header). */
  purpose: string;
  description: string;
  /** Short instruction shown to the child. */
  instruction: string;
  /** Question types the template is designed for (Admin guidance). */
  questionTypes: readonly ChoiceQuestionType[];
  icon: LucideIcon;
  tone: GameTone;
  /** The challenge for the template's own question type. */
  Challenge: ComponentType<ChallengeProps>;
}
