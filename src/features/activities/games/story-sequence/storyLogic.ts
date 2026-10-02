import { shuffle } from '@/features/activities/games/shared/shuffle';

/** Moves the item at `from` by `offset` (−1 up, +1 down). Out-of-range moves are ignored. */
export function moveItem<T>(items: readonly T[], from: number, offset: -1 | 1): T[] {
  const to = from + offset;
  const result = [...items];
  const moving = result[from];
  const other = result[to];
  if (moving === undefined || other === undefined) return result;
  result[from] = other;
  result[to] = moving;
  return result;
}

/** Per position: is this item where it belongs? */
export function correctPositions<T extends { id: string }>(
  items: readonly T[],
  expected: readonly T[],
): boolean[] {
  return items.map((item, index) => item.id === expected[index]?.id);
}

/** A shuffled order that is never already correct. */
export function shuffleStory<T extends { id: string }>(
  events: readonly T[],
  random: () => number = Math.random,
): T[] {
  const shuffled = shuffle(events, random);
  if (events.length > 1 && correctPositions(shuffled, events).every(Boolean)) {
    return [...shuffled.slice(1), ...shuffled.slice(0, 1)];
  }
  return shuffled;
}
