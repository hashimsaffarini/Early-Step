import { checkInput, extendSequence } from './colorLogic';

describe('colour memory logic', () => {
  it('adds one pad per level', () => {
    expect(extendSequence(['red'], () => 0)).toEqual(['red', 'red']);
    expect(extendSequence([], () => 0.99)).toEqual(['yellow']);
  });

  it('checks the taps against the sequence', () => {
    expect(checkInput(['red', 'blue'], ['red'])).toBe('continue');
    expect(checkInput(['red', 'blue'], ['red', 'blue'])).toBe('complete');
    expect(checkInput(['red', 'blue'], ['blue'])).toBe('mistake');
  });
});
