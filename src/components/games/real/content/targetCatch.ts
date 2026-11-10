import type { CatchLevel, Difficulty } from '../types';

/** Early Step educational content for «اصطد الهدف»: catch the moving targets that fit. */
export const CATCH_LEVELS: Readonly<Record<Difficulty, CatchLevel>> = {
  easy: {
    prompt: 'اصطد كل بالون عليه 🐱 قطة',
    targets: [{ emoji: '🐱', label: 'قطة' }],
    distractors: [
      { emoji: '🐶', label: 'كلب' },
      { emoji: '🐰', label: 'أرنب' },
    ],
    goal: 3,
    balloons: 4,
    floatSeconds: 9,
  },
  medium: {
    prompt: 'اصطد كل بالون عليه حرف أ',
    targets: [{ emoji: 'أ', label: 'حرف أ' }],
    distractors: [
      { emoji: 'ب', label: 'حرف ب' },
      { emoji: 'ت', label: 'حرف ت' },
      { emoji: 'م', label: 'حرف م' },
    ],
    goal: 5,
    balloons: 5,
    floatSeconds: 7,
  },
  hard: {
    prompt: 'اصطد الأعداد الزوجية فقط: 2، 4، 6، 8',
    targets: [
      { emoji: '2', label: 'الرقم 2' },
      { emoji: '4', label: 'الرقم 4' },
      { emoji: '6', label: 'الرقم 6' },
      { emoji: '8', label: 'الرقم 8' },
    ],
    distractors: [
      { emoji: '1', label: 'الرقم 1' },
      { emoji: '3', label: 'الرقم 3' },
      { emoji: '5', label: 'الرقم 5' },
      { emoji: '7', label: 'الرقم 7' },
    ],
    goal: 7,
    balloons: 6,
    floatSeconds: 6,
  },
};
