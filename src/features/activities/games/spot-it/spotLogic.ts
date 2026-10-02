import { shuffle } from '@/features/activities/games/shared/shuffle';

import type { SpotItem, SpotLevel } from './content';

export interface SpotCell extends SpotItem {
  id: string;
  isTarget: boolean;
}

/** `count` targets + distractors (cycled) to fill the grid, shuffled. */
export function buildSpotGrid(level: SpotLevel, random: () => number = Math.random): SpotCell[] {
  const targets = Array.from({ length: level.count }, (_, index) => ({
    ...level.target,
    id: `target-${index.toString()}`,
    isTarget: true,
  }));
  const fillerCount = Math.max(level.gridSize - level.count, 0);
  const fillers = Array.from({ length: fillerCount }, (_, index) => {
    const item = level.distractors[index % level.distractors.length] ?? level.target;
    return { ...item, id: `other-${index.toString()}`, isTarget: false };
  });
  return shuffle([...targets, ...fillers], random);
}
