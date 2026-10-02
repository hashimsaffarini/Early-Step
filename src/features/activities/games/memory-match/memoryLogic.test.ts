import { MEMORY_PAIRS } from './content';
import { createDeck, isPair } from './memoryLogic';

describe('memory match logic', () => {
  it('creates exactly two cards per pair', () => {
    const deck = createDeck(MEMORY_PAIRS);

    expect(deck).toHaveLength(MEMORY_PAIRS.length * 2);
    for (const pair of MEMORY_PAIRS) {
      expect(deck.filter((card) => card.pairKey === pair.key)).toHaveLength(2);
    }
  });

  it('matches two different cards of the same pair only', () => {
    const deck = createDeck(MEMORY_PAIRS);
    const [cat1, cat2] = deck.filter((card) => card.pairKey === 'cat');
    const dog = deck.find((card) => card.pairKey === 'dog');
    if (!cat1 || !cat2 || !dog) throw new Error('deck incomplete');

    expect(isPair(cat1, cat2)).toBe(true);
    expect(isPair(cat1, cat1)).toBe(false);
    expect(isPair(cat1, dog)).toBe(false);
  });
});
