/**
 * Activity type. The URL segment uses `test` / `game` (Swagger `/Admin/activities/{type}`);
 * responses carry Arabic labels (Apidog example: `اختبارات`). Unknown values → null.
 */
export type ActivityType = 'test' | 'game';

const TYPE_ALIASES: Record<ActivityType, readonly string[]> = {
  test: ['test', 'tests', 'اختبار', 'اختبارات'],
  game: ['game', 'games', 'لعبة', 'ألعاب', 'العاب'],
};

export function normalizeActivityType(value: unknown): ActivityType | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (TYPE_ALIASES.test.includes(key)) return 'test';
  if (TYPE_ALIASES.game.includes(key)) return 'game';
  return null;
}
