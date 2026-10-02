/**
 * TEMPORARY UI DEMO CONTENT — initial-assessment questions for the UI prototype.
 * Real questions come from the admin-managed initial-assessment API (ACTIVITY_ENGINE.md).
 * No answer keys or scoring: the UI never marks answers right/wrong or computes results.
 */
import type { AssessmentSection } from '../types';

const reading: AssessmentSection = {
  key: 'reading',
  title: 'الحروف والقراءة',
  subtitle: 'طابق الحرف بالصورة المناسبة',
  emoji: '📖',
  category: 'reading',
  questions: [
    {
      id: 'reading-1',
      prompt: 'أي صورة تبدأ بهذا الحرف؟',
      stimulus: { value: 'ب' },
      options: [
        { label: 'بطة', emoji: '🦆' },
        { label: 'تفاحة', emoji: '🍎' },
        { label: 'سمكة', emoji: '🐟' },
        { label: 'قطة', emoji: '🐱' },
      ],
    },
    {
      id: 'reading-2',
      prompt: 'أي صورة تبدأ بهذا الحرف؟',
      stimulus: { value: 'ش' },
      options: [
        { label: 'قمر', emoji: '🌙' },
        { label: 'شمس', emoji: '☀️' },
        { label: 'وردة', emoji: '🌹' },
        { label: 'كرة', emoji: '⚽' },
      ],
    },
    {
      id: 'reading-3',
      prompt: 'أي صورة تبدأ بهذا الحرف؟',
      stimulus: { value: 'ف' },
      options: [
        { label: 'فيل', emoji: '🐘' },
        { label: 'أسد', emoji: '🦁' },
        { label: 'زرافة', emoji: '🦒' },
        { label: 'نمر', emoji: '🐯' },
      ],
    },
    {
      id: 'reading-4',
      prompt: 'ما الكلمة المناسبة للصورة؟',
      stimulus: { value: '🏠' },
      options: [{ label: 'باب' }, { label: 'بيت' }, { label: 'بحر' }, { label: 'بنت' }],
    },
    {
      id: 'reading-5',
      prompt: 'ما الكلمة المناسبة للصورة؟',
      stimulus: { value: '🌳' },
      options: [{ label: 'شجرة' }, { label: 'شباك' }, { label: 'سيارة' }, { label: 'طائرة' }],
    },
    {
      id: 'reading-6',
      prompt: 'أي صورة تبدأ بهذا الحرف؟',
      stimulus: { value: 'ك' },
      options: [
        { label: 'موزة', emoji: '🍌' },
        { label: 'كتاب', emoji: '📘' },
        { label: 'نجمة', emoji: '⭐' },
        { label: 'حصان', emoji: '🐴' },
      ],
    },
  ],
};

const math: AssessmentSection = {
  key: 'math',
  title: 'الأرقام والحساب',
  subtitle: 'عُدّ الأشياء واحسب بهدوء',
  emoji: '🔢',
  category: 'math',
  questions: [
    {
      id: 'math-1',
      prompt: 'كم تفاحة ترى؟',
      stimulus: { value: '🍎🍎🍎' },
      options: [{ label: '2' }, { label: '3' }, { label: '4' }, { label: '5' }],
    },
    {
      id: 'math-2',
      prompt: 'كم نجمة ترى؟',
      stimulus: { value: '⭐⭐⭐⭐⭐' },
      options: [{ label: '4' }, { label: '6' }, { label: '5' }, { label: '3' }],
    },
    {
      id: 'math-3',
      prompt: 'ما ناتج الجمع؟',
      stimulus: { value: '2 + 1 = ؟', kind: 'expression' },
      options: [{ label: '3' }, { label: '2' }, { label: '4' }, { label: '1' }],
    },
    {
      id: 'math-4',
      prompt: 'ما ناتج الجمع؟',
      stimulus: { value: '4 + 3 = ؟', kind: 'expression' },
      options: [{ label: '6' }, { label: '8' }, { label: '7' }, { label: '5' }],
    },
    {
      id: 'math-5',
      prompt: 'ما ناتج الطرح؟',
      stimulus: { value: '5 - 2 = ؟', kind: 'expression' },
      options: [{ label: '2' }, { label: '3' }, { label: '4' }, { label: '1' }],
    },
    {
      id: 'math-6',
      prompt: 'أي عدد هو الأكبر؟',
      stimulus: { value: '🔢' },
      options: [{ label: '4' }, { label: '9' }, { label: '2' }, { label: '6' }],
    },
  ],
};

const memory: AssessmentSection = {
  key: 'memory',
  title: 'الذاكرة والتسلسل',
  subtitle: 'تذكّر الصور ثم اختر',
  emoji: '🧠',
  category: 'memory',
  questions: [
    {
      id: 'memory-1',
      prompt: 'أي صورة كانت من الصور التي رأيتها؟',
      stimulus: { value: '❓' },
      memorize: [
        { emoji: '🐶', label: 'كلب' },
        { emoji: '⭐', label: 'نجمة' },
        { emoji: '🚗', label: 'سيارة' },
      ],
      options: [
        { label: 'قطة', emoji: '🐱' },
        { label: 'نجمة', emoji: '⭐' },
        { label: 'قمر', emoji: '🌙' },
        { label: 'كرة', emoji: '⚽' },
      ],
    },
    {
      id: 'memory-2',
      prompt: 'أي صورة كانت من الصور التي رأيتها؟',
      stimulus: { value: '❓' },
      memorize: [
        { emoji: '🍌', label: 'موزة' },
        { emoji: '🎈', label: 'بالون' },
        { emoji: '🐟', label: 'سمكة' },
      ],
      options: [
        { label: 'تفاحة', emoji: '🍎' },
        { label: 'شجرة', emoji: '🌳' },
        { label: 'بالون', emoji: '🎈' },
        { label: 'بيت', emoji: '🏠' },
      ],
    },
    {
      id: 'memory-3',
      prompt: 'ما الصورة التي كانت في الأول؟',
      stimulus: { value: '❓' },
      memorize: [
        { emoji: '🌞', label: 'شمس' },
        { emoji: '🌧️', label: 'مطر' },
        { emoji: '🌈', label: 'قوس قزح' },
      ],
      options: [
        { label: 'مطر', emoji: '🌧️' },
        { label: 'شمس', emoji: '🌞' },
        { label: 'قوس قزح', emoji: '🌈' },
        { label: 'ثلج', emoji: '❄️' },
      ],
    },
    {
      id: 'memory-4',
      prompt: 'أي صورة كانت من الصور التي رأيتها؟',
      stimulus: { value: '❓' },
      memorize: [
        { emoji: '🐘', label: 'فيل' },
        { emoji: '📘', label: 'كتاب' },
        { emoji: '🍓', label: 'فراولة' },
        { emoji: '🚲', label: 'دراجة' },
      ],
      options: [
        { label: 'دراجة', emoji: '🚲' },
        { label: 'طائرة', emoji: '✈️' },
        { label: 'قلم', emoji: '✏️' },
        { label: 'أرنب', emoji: '🐰' },
      ],
    },
    {
      id: 'memory-5',
      prompt: 'ما الصورة التي كانت في الآخر؟',
      stimulus: { value: '❓' },
      memorize: [
        { emoji: '🐱', label: 'قطة' },
        { emoji: '🌹', label: 'وردة' },
        { emoji: '⚽', label: 'كرة' },
      ],
      options: [
        { label: 'وردة', emoji: '🌹' },
        { label: 'قطة', emoji: '🐱' },
        { label: 'نجمة', emoji: '⭐' },
        { label: 'كرة', emoji: '⚽' },
      ],
    },
  ],
};

const attention: AssessmentSection = {
  key: 'attention',
  title: 'التركيز والانتباه',
  subtitle: 'ابحث عن الصورة المختلفة',
  emoji: '👁️',
  category: 'attention',
  questions: [
    {
      id: 'attention-1',
      prompt: 'أي صورة مختلفة عن الباقي؟',
      stimulus: { value: '🍎 🍎 🍌 🍎' },
      options: [
        { label: 'تفاحة', emoji: '🍎' },
        { label: 'موزة', emoji: '🍌' },
        { label: 'عنب', emoji: '🍇' },
        { label: 'برتقالة', emoji: '🍊' },
      ],
    },
    {
      id: 'attention-2',
      prompt: 'أي صورة مختلفة عن الباقي؟',
      stimulus: { value: '🐶 🐱 🐶 🐶' },
      options: [
        { label: 'كلب', emoji: '🐶' },
        { label: 'أرنب', emoji: '🐰' },
        { label: 'قطة', emoji: '🐱' },
        { label: 'فأر', emoji: '🐭' },
      ],
    },
    {
      id: 'attention-3',
      prompt: 'كم نجمة بين الأشكال؟',
      stimulus: { value: '⭐ 🔵 ⭐ 🔺 ⭐' },
      options: [{ label: '2' }, { label: '3' }, { label: '4' }, { label: '1' }],
    },
    {
      id: 'attention-4',
      prompt: 'أي صورة مختلفة عن الباقي؟',
      stimulus: { value: '🚗 🚗 🚗 🚲' },
      options: [
        { label: 'دراجة', emoji: '🚲' },
        { label: 'سيارة', emoji: '🚗' },
        { label: 'حافلة', emoji: '🚌' },
        { label: 'طائرة', emoji: '✈️' },
      ],
    },
    {
      id: 'attention-5',
      prompt: 'كم قلباً أحمر ترى؟',
      stimulus: { value: '❤️ 💙 ❤️ 💚 ❤️ ❤️' },
      options: [{ label: '3' }, { label: '5' }, { label: '4' }, { label: '2' }],
    },
    {
      id: 'attention-6',
      prompt: 'أي صورة مختلفة عن الباقي؟',
      stimulus: { value: '🌙 🌙 ☀️ 🌙' },
      options: [
        { label: 'قمر', emoji: '🌙' },
        { label: 'نجمة', emoji: '⭐' },
        { label: 'سحابة', emoji: '☁️' },
        { label: 'شمس', emoji: '☀️' },
      ],
    },
  ],
};

/** Sections in play order (Replit order). */
export const ASSESSMENT_SECTIONS: readonly AssessmentSection[] = [reading, math, memory, attention];
