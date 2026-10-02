/**
 * TEMPORARY UI DEMO CONTENT — the 11 Replit prototype games (visual/UX reference only).
 * Real activities come from the admin-managed content API later (see ACTIVITY_ENGINE.md);
 * this catalogue exists so the catalogue and player UI can be built and reviewed.
 */
import type { ActivityCategory, ActivityDifficulty } from '@/constants/activityCategories';

export const GAME_IDS = [
  'memory-match',
  'word-reading',
  'missing-numbers',
  'sentence-builder',
  'pattern-logic',
  'color-memory',
  'listen-choose',
  'balloon-pop',
  'word-scramble',
  'spot-it',
  'story-sequence',
] as const;

export type GameId = (typeof GAME_IDS)[number];

export interface GameDefinition {
  id: GameId;
  title: string;
  description: string;
  category: ActivityCategory;
  emoji: string;
  difficulty: ActivityDifficulty;
  /** "كيف ألعب؟" steps on the start screen. */
  instructions: readonly string[];
}

export const GAMES: readonly GameDefinition[] = [
  {
    id: 'memory-match',
    title: 'مطابقة البطاقات',
    description: 'اقلب البطاقات وابحث عن كل صورتين متشابهتين.',
    category: 'memory',
    emoji: '🧩',
    difficulty: 'easy',
    instructions: ['اضغط على بطاقة لتقلبها.', 'اقلب بطاقة ثانية وتذكّر الصور.', 'طابق كل الأزواج.'],
  },
  {
    id: 'word-reading',
    title: 'الكلمات المتقاطعة',
    description: 'انظر إلى الصورة واختر الكلمة الصحيحة.',
    category: 'reading',
    emoji: '📖',
    difficulty: 'easy',
    instructions: ['انظر إلى الصورة.', 'اقرأ الكلمات الأربع.', 'اختر الكلمة التي تناسب الصورة.'],
  },
  {
    id: 'missing-numbers',
    title: 'الأرقام المفقودة',
    description: 'أكمل سلسلة الأرقام بالرقم الناقص.',
    category: 'math',
    emoji: '🔢',
    difficulty: 'easy',
    instructions: ['انظر إلى الأرقام بالترتيب.', 'فكّر: كيف تزيد الأرقام؟', 'اختر الرقم الناقص.'],
  },
  {
    id: 'sentence-builder',
    title: 'تشكيل الجمل',
    description: 'رتّب الكلمات لتكوين جملة صحيحة.',
    category: 'writing',
    emoji: '✍️',
    difficulty: 'medium',
    instructions: [
      'اضغط على الكلمات بالترتيب الصحيح.',
      'اضغط على كلمة في الجملة لإعادتها.',
      'اضغط «تحقق» عندما تنتهي.',
    ],
  },
  {
    id: 'pattern-logic',
    title: 'المتاهة المنطقية',
    description: 'اكتشف النمط واختر الشكل الناقص.',
    category: 'logic',
    emoji: '🧠',
    difficulty: 'medium',
    instructions: ['انظر إلى الصفوف والأعمدة.', 'ابحث عن النمط المتكرر.', 'اختر الشكل الناقص.'],
  },
  {
    id: 'color-memory',
    title: 'صواني الألوان',
    description: 'شاهد ترتيب الألوان ثم أعده بنفس الترتيب.',
    category: 'memory',
    emoji: '🎨',
    difficulty: 'easy',
    instructions: [
      'شاهد الصواني وهي تضيء.',
      'اضغط الصواني بنفس الترتيب.',
      'في كل مستوى يزيد لون جديد.',
    ],
  },
  {
    id: 'listen-choose',
    title: 'استمع واختر',
    description: 'استمع إلى الكلمة واختر الصورة المناسبة.',
    category: 'listening',
    emoji: '🔊',
    difficulty: 'medium',
    instructions: [
      'اضغط زر السماعة لتسمع الكلمة.',
      'يمكنك الاستماع مرة أخرى.',
      'اختر الصورة المناسبة.',
    ],
  },
  {
    id: 'balloon-pop',
    title: 'فقّع البالون',
    description: 'حُلّ المسألة وفقّع البالون الذي يحمل الإجابة.',
    category: 'math',
    emoji: '🎈',
    difficulty: 'medium',
    instructions: [
      'اقرأ المسألة في الأعلى.',
      'ابحث عن البالون الذي يحمل الإجابة.',
      'اضغط عليه لتفقعه.',
    ],
  },
  {
    id: 'word-scramble',
    title: 'رتّب الحروف',
    description: 'رتّب الحروف لتكوين الكلمة الصحيحة.',
    category: 'reading',
    emoji: '🔤',
    difficulty: 'medium',
    instructions: [
      'انظر إلى التلميح والصورة.',
      'اضغط الحروف بالترتيب الصحيح.',
      'اضغط على حرف في الخانات لإعادته.',
    ],
  },
  {
    id: 'spot-it',
    title: 'ابحث وجِد!',
    description: 'ابحث عن الصور المطلوبة بين الصور الكثيرة.',
    category: 'logic',
    emoji: '👁️',
    difficulty: 'medium',
    instructions: ['اقرأ المهمة في الأعلى.', 'ابحث عن الصورة المطلوبة.', 'اضغط على كل صورة تجدها.'],
  },
  {
    id: 'story-sequence',
    title: 'تسلسل القصة',
    description: 'رتّب أحداث القصة من البداية إلى النهاية.',
    category: 'reading',
    emoji: '📚',
    difficulty: 'medium',
    instructions: ['اقرأ الأحداث.', 'حرّك كل حدث بالأسهم إلى مكانه.', 'اضغط «تحقق» لترى النتيجة.'],
  },
];

export function findGame(gameId: string | undefined): GameDefinition | undefined {
  return GAMES.find((game) => game.id === gameId);
}
