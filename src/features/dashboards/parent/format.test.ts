import { getGreeting } from './format';

describe('parent dashboard greeting', () => {
  it('greets by time of day', () => {
    expect(getGreeting(new Date('2026-09-29T08:00:00'))).toBe('صباح الخير');
    expect(getGreeting(new Date('2026-09-29T18:00:00'))).toBe('مساء الخير');
  });
});
