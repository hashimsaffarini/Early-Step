/** TEMPORARY UI DEMO CONTENT — find-the-picture levels (every picture has an Arabic name). */
export interface SpotItem {
  emoji: string;
  name: string;
}

export interface SpotLevel {
  target: SpotItem;
  /** Other pictures used to fill the grid. */
  distractors: readonly SpotItem[];
  count: number;
  gridSize: number;
}

export const SPOT_LEVELS: readonly SpotLevel[] = [
  {
    target: { emoji: '🐱', name: 'قطة' },
    distractors: [
      { emoji: '🐶', name: 'كلب' },
      { emoji: '🦁', name: 'أسد' },
      { emoji: '🐸', name: 'ضفدع' },
      { emoji: '🐻', name: 'دب' },
      { emoji: '🐼', name: 'باندا' },
      { emoji: '🐰', name: 'أرنب' },
    ],
    count: 3,
    gridSize: 12,
  },
  {
    target: { emoji: '⭐', name: 'نجمة' },
    distractors: [
      { emoji: '🌙', name: 'قمر' },
      { emoji: '☀️', name: 'شمس' },
      { emoji: '☁️', name: 'غيمة' },
      { emoji: '🌈', name: 'قوس قزح' },
      { emoji: '❄️', name: 'ثلج' },
      { emoji: '💧', name: 'قطرة' },
    ],
    count: 4,
    gridSize: 16,
  },
  {
    target: { emoji: '🍎', name: 'تفاحة' },
    distractors: [
      { emoji: '🍊', name: 'برتقالة' },
      { emoji: '🍋', name: 'ليمونة' },
      { emoji: '🍇', name: 'عنب' },
      { emoji: '🍓', name: 'فراولة' },
      { emoji: '🍌', name: 'موزة' },
      { emoji: '🍒', name: 'كرز' },
    ],
    count: 4,
    gridSize: 16,
  },
  {
    target: { emoji: '🚗', name: 'سيارة' },
    distractors: [
      { emoji: '✈️', name: 'طائرة' },
      { emoji: '🚢', name: 'سفينة' },
      { emoji: '🚂', name: 'قطار' },
      { emoji: '🚲', name: 'دراجة' },
      { emoji: '🚌', name: 'حافلة' },
      { emoji: '🚜', name: 'جرار' },
    ],
    count: 5,
    gridSize: 20,
  },
];
