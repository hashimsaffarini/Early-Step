import { createPlaceState, matchesAnswer, placeToken, removeToken } from './tapToPlace';

const alwaysFirst = () => 0.999;

describe('tap to place', () => {
  it('never starts with the answer already built in order', () => {
    const state = createPlaceState(['أ', 'ب', 'ج'], () => 0.999);

    expect(state.placed).toEqual([]);
    expect(state.tray.map((token) => token.text)).not.toEqual(['أ', 'ب', 'ج']);
  });

  it('moves tokens between the tray and the answer line', () => {
    const start = createPlaceState(['الولد', 'يذهب'], alwaysFirst);
    const first = start.tray[0];
    if (!first) throw new Error('empty tray');

    const placed = placeToken(start, first.id);
    expect(placed.placed).toEqual([first]);
    expect(placed.tray).toHaveLength(1);

    const removed = removeToken(placed, first.id);
    expect(removed.placed).toEqual([]);
    expect(removed.tray).toHaveLength(2);
  });

  it('accepts any of the allowed orders', () => {
    const accepted = [
      ['الولد', 'يذهب'],
      ['يذهب', 'الولد'],
    ];
    const tokens = (texts: string[]) => texts.map((text) => ({ id: text, text }));

    expect(matchesAnswer(tokens(['يذهب', 'الولد']), accepted)).toBe(true);
    expect(matchesAnswer(tokens(['الولد']), accepted)).toBe(false);
  });
});
