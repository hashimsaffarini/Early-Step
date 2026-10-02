/** TEMPORARY UI DEMO CONTENT — 3×3 picture patterns with one missing cell (`null`). */
export interface PatternRound {
  grid: readonly (readonly (string | null)[])[];
  question: string;
  options: readonly string[];
  answer: string;
  /** Shown after answering. */
  explanation: string;
}

export const PATTERN_ROUNDS: readonly PatternRound[] = [
  {
    grid: [
      ['🔴', '🔵', '🔴'],
      ['🔵', '🔴', '🔵'],
      ['🔴', '🔵', null],
    ],
    question: 'ما الشكل الذي يكمل النمط؟',
    options: ['🔴', '🔵', '🟡', '🟢'],
    answer: '🔴',
    explanation: 'الألوان تتناوب: أحمر ثم أزرق.',
  },
  {
    grid: [
      ['⭐', '⭐⭐', '⭐⭐⭐'],
      ['🌙', '🌙🌙', '🌙🌙🌙'],
      ['❤️', '❤️❤️', null],
    ],
    question: 'كم قلباً نحتاج؟',
    options: ['❤️', '❤️❤️', '❤️❤️❤️', '❤️❤️❤️❤️'],
    answer: '❤️❤️❤️',
    explanation: 'في كل صف يزيد العدد واحداً.',
  },
  {
    grid: [
      ['🔺', '🔶', '🔺'],
      ['🔶', '🔺', '🔶'],
      [null, '🔶', '🔺'],
    ],
    question: 'ما الشكل في الخانة الفارغة؟',
    options: ['🔺', '🔶', '🔷', '🟣'],
    answer: '🔺',
    explanation: 'المثلث والمعيّن يتناوبان في كل صف.',
  },
  {
    grid: [
      ['🐱', '🐶', '🐰'],
      ['🐶', '🐰', '🐱'],
      ['🐰', '🐱', null],
    ],
    question: 'أي حيوان ينقص؟',
    options: ['🐱', '🐶', '🐰', '🐻'],
    answer: '🐶',
    explanation: 'كل حيوان يظهر مرة واحدة في كل صف.',
  },
  {
    grid: [
      ['🍎', '🍎', '🍌'],
      ['🍎', '🍎', '🍌'],
      ['🍎', null, '🍌'],
    ],
    question: 'ما الفاكهة الناقصة؟',
    options: ['🍌', '🍎', '🍇', '🍓'],
    answer: '🍎',
    explanation: 'كل الصفوف متشابهة.',
  },
];
