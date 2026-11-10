import type { Difficulty, SequenceLevel } from '../types';

/** Early Step educational content for «قطار الترتيب»: put the wagons in order. */
export const SEQUENCE_LEVELS: Readonly<Record<Difficulty, SequenceLevel>> = {
  easy: {
    stages: [
      {
        prompt: 'رتّب الأعداد من الأصغر إلى الأكبر',
        items: [
          { emoji: '1', label: 'الرقم 1' },
          { emoji: '2', label: 'الرقم 2' },
          { emoji: '3', label: 'الرقم 3' },
        ],
      },
    ],
  },
  medium: {
    stages: [
      {
        prompt: 'رتّب الأعداد من الأصغر إلى الأكبر',
        items: [
          { emoji: '2', label: 'الرقم 2' },
          { emoji: '4', label: 'الرقم 4' },
          { emoji: '6', label: 'الرقم 6' },
          { emoji: '8', label: 'الرقم 8' },
        ],
      },
      {
        prompt: 'رتّب يوم الطفل: من الصباح إلى الليل',
        items: [
          { emoji: '🌅', label: 'الاستيقاظ صباحاً' },
          { emoji: '🥣', label: 'الفطور' },
          { emoji: '🎒', label: 'الذهاب إلى المدرسة' },
          { emoji: '🛏️', label: 'النوم ليلاً' },
        ],
      },
    ],
  },
  hard: {
    stages: [
      {
        prompt: 'رتّب الحروف كما في الأبجدية: أ ب ت ث ج',
        items: [
          { emoji: 'أ', label: 'حرف أ' },
          { emoji: 'ب', label: 'حرف ب' },
          { emoji: 'ت', label: 'حرف ت' },
          { emoji: 'ث', label: 'حرف ث' },
          { emoji: 'ج', label: 'حرف ج' },
        ],
      },
      {
        prompt: 'رتّب مراحل نمو النبتة',
        items: [
          { emoji: '🌰', label: 'البذرة' },
          { emoji: '🌱', label: 'النبتة الصغيرة' },
          { emoji: '🪴', label: 'النبتة الكبيرة' },
          { emoji: '🌳', label: 'الشجرة' },
        ],
      },
      {
        prompt: 'رتّب من الأصغر إلى الأكبر',
        items: [
          { emoji: '🐜', label: 'نملة' },
          { emoji: '🐭', label: 'فأر' },
          { emoji: '🐕', label: 'كلب' },
          { emoji: '🐘', label: 'فيل' },
        ],
      },
    ],
  },
};
