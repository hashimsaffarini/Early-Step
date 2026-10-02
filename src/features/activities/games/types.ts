import type { SoundEffects } from '@/components/players';

/** Outcome reported by every game when it ends. */
export interface GameResult {
  /** Correct answers / found items / completed rounds. */
  correct: number;
  /** Out of how many (stars are proportional to correct ÷ total). */
  total: number;
  /** Optional neutral sentence replacing the default "X من Y" line. */
  summary?: string;
}

export interface GameProps {
  onFinish: (result: GameResult) => void;
  sound: SoundEffects;
}
