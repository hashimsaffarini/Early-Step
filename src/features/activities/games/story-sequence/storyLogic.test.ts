import { correctPositions, moveItem, shuffleStory } from './storyLogic';

const events = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('story sequence logic', () => {
  it('moves an item up or down and ignores out-of-range moves', () => {
    expect(moveItem(events, 1, -1).map((event) => event.id)).toEqual(['b', 'a', 'c']);
    expect(moveItem(events, 1, 1).map((event) => event.id)).toEqual(['a', 'c', 'b']);
    expect(moveItem(events, 0, -1)).toEqual(events);
  });

  it('marks each position as correct or not', () => {
    expect(
      correctPositions(
        [events[0], events[2], events[1]].flatMap((e) => (e ? [e] : [])),
        events,
      ),
    ).toEqual([true, false, false]);
  });

  it('never starts in the correct order', () => {
    for (const seed of [0, 0.3, 0.6, 0.999]) {
      const shuffled = shuffleStory(events, () => seed);
      expect(correctPositions(shuffled, events).every(Boolean)).toBe(false);
    }
  });
});
