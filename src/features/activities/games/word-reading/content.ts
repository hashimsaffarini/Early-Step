/** TEMPORARY UI DEMO CONTENT — word-reading rounds (picture → word). */
export interface WordReadingRound {
  emoji: string;
  /** Vocalised word shown on the stimulus card. */
  word: string;
  options: readonly string[];
  answer: string;
}

export const WORD_READING_ROUNDS: readonly WordReadingRound[] = [
  { emoji: '☀️', word: 'شَمْسٌ', options: ['شجرة', 'شمس', 'سمكة', 'شارع'], answer: 'شمس' },
  { emoji: '📚', word: 'كِتَابٌ', options: ['كلب', 'كتب', 'كتاب', 'كرة'], answer: 'كتاب' },
  { emoji: '🏠', word: 'بَيْتٌ', options: ['بحر', 'بيت', 'بطة', 'باب'], answer: 'بيت' },
  { emoji: '✏️', word: 'قَلَمٌ', options: ['قمر', 'قلم', 'قلب', 'قطة'], answer: 'قلم' },
  { emoji: '🚗', word: 'سَيَّارَةٌ', options: ['سيرة', 'سيارة', 'سمكة', 'سماء'], answer: 'سيارة' },
  { emoji: '🌹', word: 'وَرْدَةٌ', options: ['وردة', 'ورقة', 'واجب', 'وطن'], answer: 'وردة' },
  { emoji: '🍎', word: 'تُفَّاحَةٌ', options: ['تمر', 'تفاحة', 'توت', 'تين'], answer: 'تفاحة' },
  { emoji: '⭐', word: 'نَجْمَةٌ', options: ['نمر', 'نهر', 'نجمة', 'نافذة'], answer: 'نجمة' },
];
