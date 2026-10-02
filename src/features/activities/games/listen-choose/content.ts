/** TEMPORARY UI DEMO CONTENT — hear a word, choose its picture. */
export interface ListenRound {
  /** Word read aloud (speech synthesis) or shown on request. */
  word: string;
  options: readonly { value: string; emoji: string }[];
  answer: string;
}

export const LISTEN_ROUNDS: readonly ListenRound[] = [
  {
    word: 'قطة',
    options: [
      { value: 'كلب', emoji: '🐶' },
      { value: 'قطة', emoji: '🐱' },
      { value: 'بقرة', emoji: '🐮' },
      { value: 'حصان', emoji: '🐴' },
    ],
    answer: 'قطة',
  },
  {
    word: 'تفاحة',
    options: [
      { value: 'موزة', emoji: '🍌' },
      { value: 'عنب', emoji: '🍇' },
      { value: 'تفاحة', emoji: '🍎' },
      { value: 'برتقالة', emoji: '🍊' },
    ],
    answer: 'تفاحة',
  },
  {
    word: 'طائرة',
    options: [
      { value: 'طائرة', emoji: '✈️' },
      { value: 'سيارة', emoji: '🚗' },
      { value: 'سفينة', emoji: '🚢' },
      { value: 'دراجة', emoji: '🚲' },
    ],
    answer: 'طائرة',
  },
  {
    word: 'شمس',
    options: [
      { value: 'قمر', emoji: '🌙' },
      { value: 'نجمة', emoji: '⭐' },
      { value: 'غيمة', emoji: '☁️' },
      { value: 'شمس', emoji: '☀️' },
    ],
    answer: 'شمس',
  },
  {
    word: 'كرة',
    options: [
      { value: 'كتاب', emoji: '📚' },
      { value: 'كرة', emoji: '⚽' },
      { value: 'قلم', emoji: '✏️' },
      { value: 'ساعة', emoji: '⏰' },
    ],
    answer: 'كرة',
  },
  {
    word: 'سمكة',
    options: [
      { value: 'بطة', emoji: '🦆' },
      { value: 'فراشة', emoji: '🦋' },
      { value: 'سمكة', emoji: '🐟' },
      { value: 'أسد', emoji: '🦁' },
    ],
    answer: 'سمكة',
  },
];
