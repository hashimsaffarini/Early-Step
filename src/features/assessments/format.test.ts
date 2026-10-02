import { formatQuestionCount } from './format';

describe('formatQuestionCount', () => {
  it.each([
    [1, 'سؤال واحد'],
    [2, 'سؤالان'],
    [6, '6 أسئلة'],
    [11, '11 سؤالاً'],
  ])('formats %i', (count, expected) => {
    expect(formatQuestionCount(count)).toBe(expected);
  });
});
