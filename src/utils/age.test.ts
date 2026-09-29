import { ageInYears, formatAge } from './age';

describe('age utilities', () => {
  it.each([
    [0, 'أقل من سنة'],
    [1, 'سنة واحدة'],
    [2, 'سنتان'],
    [5, '5 سنوات'],
    [11, '11 سنة'],
  ])('formats %i as "%s"', (years, expected) => {
    expect(formatAge(years)).toBe(expected);
  });

  it('computes whole years around the birthday', () => {
    const today = new Date('2026-09-29T12:00:00');
    expect(ageInYears('2019-09-29', today)).toBe(7);
    expect(ageInYears('2019-09-30', today)).toBe(6);
    expect(ageInYears('2026-10-01', today)).toBe(0);
  });
});
