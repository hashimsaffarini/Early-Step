/**
 * TEMPORARY UI DEMO CONTENT — interactive tests for the catalogue and test player UI
 * (Replit prototype reference). Real tests come from the admin-managed content API later
 * (see ACTIVITY_ENGINE.md). Ids follow docs/MOCK_DATA.md. Child-friendly, neutral content only.
 */
import type { ActivityCategory, ActivityDifficulty } from '@/constants/activityCategories';

export const TEST_IDS = [
  'letters-test',
  'numbers-test',
  'short-memory-test',
  'listening-test',
  'writing-test',
  'logic-test',
] as const;

export type TestId = (typeof TEST_IDS)[number];

/**
 * A question prompt is a list of parts: Arabic text, or an inherently left-to-right fragment
 * (math expression, number sequence) rendered in `<bdi dir="ltr">` so it never reorders.
 */
export type PromptPart = string | { ltr: string };

export interface TestOption {
  label: string;
  emoji?: string;
}

export interface TestQuestion {
  id: string;
  prompt: readonly PromptPart[];
  options: readonly TestOption[];
  correctIndex: number;
}

export interface TestDefinition {
  id: TestId;
  title: string;
  description: string;
  category: ActivityCategory;
  emoji: string;
  difficulty: ActivityDifficulty;
  /** Approximate duration shown on the catalogue card. */
  durationMinutes: number;
  questions: readonly TestQuestion[];
}

export const TESTS: readonly TestDefinition[] = [
  {
    id: 'letters-test',
    title: 'اختبار الحروف',
    description: 'أسئلة بسيطة عن الحروف وأصواتها في الكلمات.',
    category: 'reading',
    emoji: '📖',
    difficulty: 'easy',
    durationMinutes: 4,
    questions: [
      {
        id: 'letters-1',
        prompt: ['ما الحرف الأول في كلمة «قمر»؟'],
        options: [{ label: 'ق' }, { label: 'م' }, { label: 'ر' }, { label: 'ب' }],
        correctIndex: 0,
      },
      {
        id: 'letters-2',
        prompt: ['أي كلمة تبدأ بحرف الباء؟'],
        options: [
          { label: 'تفاحة', emoji: '🍎' },
          { label: 'بطة', emoji: '🦆' },
          { label: 'سمكة', emoji: '🐟' },
          { label: 'قطة', emoji: '🐱' },
        ],
        correctIndex: 1,
      },
      {
        id: 'letters-3',
        prompt: ['كم حرفاً في كلمة «شمس»؟'],
        options: [{ label: '2' }, { label: '3' }, { label: '4' }, { label: '5' }],
        correctIndex: 1,
      },
      {
        id: 'letters-4',
        prompt: ['أي كلمة تنتهي بحرف الراء؟'],
        options: [
          { label: 'بيت', emoji: '🏠' },
          { label: 'شمس', emoji: '☀️' },
          { label: 'كتاب', emoji: '📘' },
          { label: 'قمر', emoji: '🌙' },
        ],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 'numbers-test',
    title: 'اختبار الأعداد',
    description: 'جمع وطرح بسيط ومقارنة بين الأعداد.',
    category: 'math',
    emoji: '🔢',
    difficulty: 'medium',
    durationMinutes: 4,
    questions: [
      {
        id: 'numbers-1',
        prompt: ['كم يساوي', { ltr: '3 + 4 = ?' }],
        options: [{ label: '6' }, { label: '7' }, { label: '8' }, { label: '9' }],
        correctIndex: 1,
      },
      {
        id: 'numbers-2',
        prompt: ['أي عدد هو الأكبر؟'],
        options: [{ label: '5' }, { label: '9' }, { label: '2' }, { label: '7' }],
        correctIndex: 1,
      },
      {
        id: 'numbers-3',
        prompt: ['كم يساوي', { ltr: '10 - 3 = ?' }],
        options: [{ label: '6' }, { label: '8' }, { label: '7' }, { label: '5' }],
        correctIndex: 2,
      },
      {
        id: 'numbers-4',
        prompt: ['كم تفاحة ترى؟ 🍎🍎🍎🍎'],
        options: [{ label: '3' }, { label: '5' }, { label: '6' }, { label: '4' }],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 'short-memory-test',
    title: 'اختبار الذاكرة القصيرة',
    description: 'تذكّر الأشكال والألوان والترتيب.',
    category: 'memory',
    emoji: '🧠',
    difficulty: 'medium',
    durationMinutes: 3,
    questions: [
      {
        id: 'memory-1',
        prompt: ['انظر: ⭐ 🔵 🔺 — أي شكل جاء أولاً؟'],
        options: [
          { label: 'دائرة', emoji: '🔵' },
          { label: 'نجمة', emoji: '⭐' },
          { label: 'مثلث', emoji: '🔺' },
          { label: 'مربع', emoji: '⬛' },
        ],
        correctIndex: 1,
      },
      {
        id: 'memory-2',
        prompt: ['في إشارة المرور، ما اللون الذي يأتي بعد الأحمر؟'],
        options: [
          { label: 'الأخضر', emoji: '🟢' },
          { label: 'الأصفر', emoji: '🟡' },
          { label: 'الأزرق', emoji: '🔵' },
          { label: 'الأسود', emoji: '⚫' },
        ],
        correctIndex: 1,
      },
      {
        id: 'memory-3',
        prompt: ['تذكّر: 🐶 🐱 🐰 — أي حيوان كان في الوسط؟'],
        options: [
          { label: 'كلب', emoji: '🐶' },
          { label: 'أرنب', emoji: '🐰' },
          { label: 'قطة', emoji: '🐱' },
          { label: 'فأر', emoji: '🐭' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'listening-test',
    title: 'اختبار الاستماع',
    description: 'تعرّف على الأصوات من حولك.',
    category: 'listening',
    emoji: '🎧',
    difficulty: 'easy',
    durationMinutes: 3,
    questions: [
      {
        id: 'listening-1',
        prompt: ['أي صوت يصدره القط؟'],
        options: [{ label: 'نباح' }, { label: 'مواء' }, { label: 'زئير' }, { label: 'صهيل' }],
        correctIndex: 1,
      },
      {
        id: 'listening-2',
        prompt: ['أي حيوان يقول «ماء ماء»؟'],
        options: [
          { label: 'خروف', emoji: '🐑' },
          { label: 'بقرة', emoji: '🐄' },
          { label: 'ديك', emoji: '🐓' },
          { label: 'بطة', emoji: '🦆' },
        ],
        correctIndex: 0,
      },
      {
        id: 'listening-3',
        prompt: ['ما الذي يصدر صوت «تك تك»؟'],
        options: [
          { label: 'الشجرة', emoji: '🌳' },
          { label: 'الكتاب', emoji: '📘' },
          { label: 'الساعة', emoji: '⏰' },
          { label: 'الوسادة', emoji: '🛏️' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'writing-test',
    title: 'اختبار الكتابة',
    description: 'إكمال الكلمات وترتيب الحروف.',
    category: 'writing',
    emoji: '✏️',
    difficulty: 'easy',
    durationMinutes: 3,
    questions: [
      {
        id: 'writing-1',
        prompt: ['ما الحرف الناقص في كلمة «قـ ـم» ✏️؟'],
        options: [{ label: 'ن' }, { label: 'ل' }, { label: 'ر' }, { label: 'س' }],
        correctIndex: 1,
      },
      {
        id: 'writing-2',
        prompt: ['رتّب الحروف «ا - ب - ب» لتكوين كلمة 🚪'],
        options: [{ label: 'اب ب' }, { label: 'ب با' }, { label: 'باب' }, { label: 'بب ا' }],
        correctIndex: 2,
      },
      {
        id: 'writing-3',
        prompt: ['أكمل الجملة: أنا أكتب بـ ...'],
        options: [
          { label: 'القلم', emoji: '✏️' },
          { label: 'الماء', emoji: '💧' },
          { label: 'الكرة', emoji: '⚽' },
          { label: 'الشمس', emoji: '☀️' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'logic-test',
    title: 'اختبار التفكير المنطقي',
    description: 'أنماط وتصنيف وأعداد متتالية.',
    category: 'logic',
    emoji: '💡',
    difficulty: 'hard',
    durationMinutes: 4,
    questions: [
      {
        id: 'logic-1',
        prompt: ['ما الشكل التالي؟ 🔴 🔵 🔴 🔵 ...'],
        options: [
          { label: 'أحمر', emoji: '🔴' },
          { label: 'أخضر', emoji: '🟢' },
          { label: 'أزرق', emoji: '🔵' },
          { label: 'أصفر', emoji: '🟡' },
        ],
        correctIndex: 0,
      },
      {
        id: 'logic-2',
        prompt: ['أي واحد لا ينتمي إلى المجموعة؟'],
        options: [
          { label: 'تفاحة', emoji: '🍎' },
          { label: 'موز', emoji: '🍌' },
          { label: 'عنب', emoji: '🍇' },
          { label: 'سيارة', emoji: '🚗' },
        ],
        correctIndex: 3,
      },
      {
        id: 'logic-3',
        prompt: ['ما العدد التالي؟', { ltr: '2, 4, 6, ?' }],
        options: [{ label: '7' }, { label: '8' }, { label: '9' }, { label: '10' }],
        correctIndex: 1,
      },
    ],
  },
];

export function findTest(testId: string | undefined): TestDefinition | undefined {
  return TESTS.find((test) => test.id === testId);
}
