/** Fisher–Yates shuffle (a new array); `random` is injectable so tests stay deterministic. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = result[index];
    const other = result[swap];
    if (current === undefined || other === undefined) continue;
    result[index] = other;
    result[swap] = current;
  }
  return result;
}
