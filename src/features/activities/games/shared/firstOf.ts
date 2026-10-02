/** First item of static demo content (content arrays are never empty). */
export function firstOf<T>(items: readonly T[]): T {
  const first = items[0];
  if (first === undefined) throw new Error('Game content is empty');
  return first;
}
