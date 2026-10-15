import { formatAge } from './age';

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
});
