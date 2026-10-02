import { shuffle } from '@/features/activities/games/shared/shuffle';

import type { MemoryPair } from './content';

export interface MemoryCard {
  id: string;
  pairKey: string;
  word: string;
  emoji: string;
}

/** Two cards per pair, shuffled. */
export function createDeck(
  pairs: readonly MemoryPair[],
  random: () => number = Math.random,
): MemoryCard[] {
  const cards = pairs.flatMap((pair) =>
    ['a', 'b'].map((copy) => ({
      id: `${pair.key}-${copy}`,
      pairKey: pair.key,
      word: pair.word,
      emoji: pair.emoji,
    })),
  );
  return shuffle(cards, random);
}

export function isPair(first: MemoryCard, second: MemoryCard): boolean {
  return first.id !== second.id && first.pairKey === second.pairKey;
}
