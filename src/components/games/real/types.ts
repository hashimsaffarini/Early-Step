import type { LucideIcon } from 'lucide-react';

/** The five real Early Step games (client revision 2026-11): gameplay, not quiz questions. */
export const REAL_GAME_SLUGS = [
  'memory-pairs',
  'sort-and-match',
  'target-catch',
  'sequence-train',
  'learning-maze',
] as const;
export type RealGameSlug = (typeof REAL_GAME_SLUGS)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

/** A picture with its Arabic name (the name is also what screen readers announce). */
export interface Visual {
  emoji: string;
  label: string;
}

/** One line of the end-of-game summary (session values only — nothing is sent anywhere). */
export interface SessionFigure {
  label: string;
  value: string;
}

/** What every engine receives: its level content and a way to report the finished session. */
export interface EngineProps<TLevel> {
  level: TLevel;
  onComplete: (summary: readonly SessionFigure[]) => void;
  /** Injectable for deterministic tests; defaults to `Math.random`. */
  random?: () => number;
}

export interface MemoryPairsLevel {
  /** Each pair: two faces that belong together (identical pictures, letter ↔ picture, …). */
  pairs: readonly { id: string; a: Visual; b: Visual }[];
}

export interface SortLevel {
  zones: readonly { id: string; label: string; emoji: string }[];
  items: readonly { id: string; visual: Visual; zoneId: string }[];
}

export interface CatchLevel {
  /** What the child catches, e.g. «اصطد حرف أ». */
  prompt: string;
  targets: readonly Visual[];
  distractors: readonly Visual[];
  /** How many targets end the game. */
  goal: number;
  /** Balloons on screen at once. */
  balloons: number;
  /** Seconds for one gentle float cycle (bigger is slower). */
  floatSeconds: number;
}

export interface SequenceLevel {
  stages: readonly {
    prompt: string;
    /** In the correct order. */
    items: readonly Visual[];
  }[];
}

export interface MazeLevel {
  prompt: string;
  /** Rows of cells: `#` wall, `.` path, `S` start, `A`–`D` targets. */
  grid: readonly string[];
  targets: Readonly<Record<string, Visual>>;
  /** The target key the child must reach. */
  correct: string;
}

export interface RealGameDefinition {
  slug: RealGameSlug;
  name: string;
  /** Short description of the gameplay (Admin template card). */
  tagline: string;
  /** The skill it trains. */
  skill: string;
  /** One-line instruction for the child (start screen). */
  instruction: string;
  emoji: string;
  icon: LucideIcon;
}
