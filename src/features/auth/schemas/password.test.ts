import { evaluatePassword } from './password';

describe('evaluatePassword', () => {
  it.each([
    ['', 'weak', 0],
    ['abc', 'weak', 1],
    ['abcdefgh1', 'medium', 3],
    ['Abcdefgh1', 'medium', 4],
    ['Abcdefgh1!', 'strong', 5],
  ] as const)('rates "%s" as %s (%i criteria)', (password, level, score) => {
    const result = evaluatePassword(password);

    expect(result.level).toBe(level);
    expect(result.score).toBe(score);
    expect(result.meetsAll).toBe(level === 'strong');
  });
});
