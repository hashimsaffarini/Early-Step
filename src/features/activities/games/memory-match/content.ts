/** TEMPORARY UI DEMO CONTENT — picture pairs for the memory game. */
export interface MemoryPair {
  key: string;
  word: string;
  emoji: string;
}

export const MEMORY_PAIRS: readonly MemoryPair[] = [
  { key: 'cat', word: 'قطة', emoji: '🐱' },
  { key: 'dog', word: 'كلب', emoji: '🐶' },
  { key: 'lion', word: 'أسد', emoji: '🦁' },
  { key: 'elephant', word: 'فيل', emoji: '🐘' },
  { key: 'duck', word: 'بطة', emoji: '🦆' },
  { key: 'bear', word: 'دب', emoji: '🐻' },
];
