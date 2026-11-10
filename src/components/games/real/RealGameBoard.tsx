import {
  CATCH_LEVELS,
  MAZE_LEVELS,
  MEMORY_PAIRS_LEVELS,
  SEQUENCE_LEVELS,
  SORT_LEVELS,
} from './content';
import { LearningMaze } from './learning-maze/LearningMaze';
import { MemoryPairs } from './memory-pairs/MemoryPairs';
import { SequenceTrain } from './sequence-train/SequenceTrain';
import { SortAndMatch } from './sort-and-match/SortAndMatch';
import { TargetCatch } from './target-catch/TargetCatch';
import type { Difficulty, RealGameSlug, SessionFigure } from './types';

export interface RealGameBoardProps {
  slug: RealGameSlug;
  difficulty: Difficulty;
  onComplete: (summary: readonly SessionFigure[]) => void;
  random?: () => number;
}

/** One real game with its level for the chosen difficulty (static switch: one engine per game). */
export function RealGameBoard({ slug, difficulty, onComplete, random }: RealGameBoardProps) {
  const common = { onComplete, ...(random ? { random } : {}) };
  switch (slug) {
    case 'memory-pairs':
      return <MemoryPairs level={MEMORY_PAIRS_LEVELS[difficulty]} {...common} />;
    case 'sort-and-match':
      return <SortAndMatch level={SORT_LEVELS[difficulty]} {...common} />;
    case 'target-catch':
      return <TargetCatch level={CATCH_LEVELS[difficulty]} {...common} />;
    case 'sequence-train':
      return <SequenceTrain level={SEQUENCE_LEVELS[difficulty]} {...common} />;
    case 'learning-maze':
      return <LearningMaze level={MAZE_LEVELS[difficulty]} {...common} />;
  }
}
