import { formatAge, getGreeting } from './format';

describe('parent dashboard formatting', () => {
  it.each([
    [1, 'سنة واحدة'],
    [2, 'سنتان'],
    [5, '5 سنوات'],
    [11, '11 سنة'],
  ])('formats age %i as "%s"', (years, expected) => {
    expect(formatAge(years)).toBe(expected);
  });

  it('greets by time of day', () => {
    expect(getGreeting(new Date('2026-09-29T08:00:00'))).toBe('صباح الخير');
    expect(getGreeting(new Date('2026-09-29T18:00:00'))).toBe('مساء الخير');
  });
});
