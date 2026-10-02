/**
 * Stars earned for a result (0..max), proportional to correct answers.
 * Used for playful feedback only — never shown as a percentage or a clinical score.
 */
export function starsForScore(correct: number, total: number, maxStars = 5): number {
  if (total <= 0) return 0;
  const ratio = Math.min(Math.max(correct / total, 0), 1);
  return Math.round(ratio * maxStars);
}
