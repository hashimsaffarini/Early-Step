import type { Difficulty, MemoryPairsLevel, Visual } from '../types';

/**
 * Early Step educational content (product-owned, not student data) for «لعبة الذاكرة».
 * Easy: identical animals · medium: letter ↔ picture starting with it · hard: number ↔ quantity.
 */
const same = (id: string, visual: Visual) => ({ id, a: visual, b: visual });

export const MEMORY_PAIRS_LEVELS: Readonly<Record<Difficulty, MemoryPairsLevel>> = {
  easy: {
    pairs: [same('cat', { emoji: '🐱', label: 'قطة' }), same('dog', { emoji: '🐶', label: 'كلب' })],
  },
  medium: {
    pairs: [
      { id: 'alif', a: { emoji: 'أ', label: 'حرف أ' }, b: { emoji: '🐰', label: 'أرنب' } },
      { id: 'baa', a: { emoji: 'ب', label: 'حرف ب' }, b: { emoji: '🦆', label: 'بطة' } },
      { id: 'taa', a: { emoji: 'ت', label: 'حرف ت' }, b: { emoji: '🍎', label: 'تفاحة' } },
      { id: 'seen', a: { emoji: 'س', label: 'حرف س' }, b: { emoji: '🐟', label: 'سمكة' } },
    ],
  },
  hard: {
    pairs: [
      { id: 'one', a: { emoji: '1', label: 'الرقم 1' }, b: { emoji: '⭐', label: 'نجمة واحدة' } },
      { id: 'two', a: { emoji: '2', label: 'الرقم 2' }, b: { emoji: '🍎🍎', label: 'تفاحتان' } },
      {
        id: 'three',
        a: { emoji: '3', label: 'الرقم 3' },
        b: { emoji: '🎈🎈🎈', label: 'ثلاث بالونات' },
      },
      {
        id: 'four',
        a: { emoji: '4', label: 'الرقم 4' },
        b: { emoji: '🐟🐟🐟🐟', label: 'أربع سمكات' },
      },
      {
        id: 'five',
        a: { emoji: '5', label: 'الرقم 5' },
        b: { emoji: '🌸🌸🌸🌸🌸', label: 'خمس زهرات' },
      },
      { id: 'zero', a: { emoji: '0', label: 'الرقم 0' }, b: { emoji: '🧺', label: 'سلة فارغة' } },
    ],
  },
};
