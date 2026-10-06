/** Splits free text from the API into trimmed, non-empty lines (one observation per line). */
export function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
