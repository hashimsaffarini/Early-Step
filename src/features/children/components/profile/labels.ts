const FEW_MIN = 3;
const FEW_MAX = 10;

/** Arabic count phrase for activities ("نشاط واحد", "نشاطان", "3 أنشطة", "11 نشاط"). */
export function formatActivityCount(count: number): string {
  if (count === 1) return 'نشاط واحد';
  if (count === 2) return 'نشاطان';
  if (count >= FEW_MIN && count <= FEW_MAX) return `${count.toString()} أنشطة`;
  return `${count.toString()} نشاط`;
}

/** First non-empty line of a multi-line server text (report excerpts). */
export function firstLine(text: string): string {
  return (
    text
      .split('\n')
      .find((line) => line.trim())
      ?.trim() ?? ''
  );
}
