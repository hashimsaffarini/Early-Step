/**
 * TEMPORARY UI DEMO CONTENT — games and tests a staff member can assign to a child
 * (Replit "تعيين نشاط للطفل"). Ids match the activities catalogue (docs/MOCK_DATA.md) so
 * the "العب" links open the right player. Replaced by the content API later.
 */
import type { ActivityCategory } from '@/constants/activityCategories';

import type { PlanActivityType } from '../types';

export interface AssignableActivity {
  id: string;
  title: string;
  type: PlanActivityType;
  category: ActivityCategory;
  emoji: string;
}

export const ASSIGNABLE_ACTIVITIES: readonly AssignableActivity[] = [
  { id: 'memory-match', title: 'مطابقة البطاقات', type: 'game', category: 'memory', emoji: '🧩' },
  {
    id: 'word-reading',
    title: 'الكلمات المتقاطعة',
    type: 'game',
    category: 'reading',
    emoji: '📖',
  },
  { id: 'missing-numbers', title: 'الأرقام المفقودة', type: 'game', category: 'math', emoji: '🔢' },
  { id: 'sentence-builder', title: 'تشكيل الجمل', type: 'game', category: 'writing', emoji: '✍️' },
  { id: 'pattern-logic', title: 'المتاهة المنطقية', type: 'game', category: 'logic', emoji: '🧠' },
  { id: 'color-memory', title: 'صواني الألوان', type: 'game', category: 'memory', emoji: '🎨' },
  { id: 'listen-choose', title: 'استمع واختر', type: 'game', category: 'listening', emoji: '🔊' },
  { id: 'balloon-pop', title: 'فقّع البالون', type: 'game', category: 'math', emoji: '🎈' },
  { id: 'word-scramble', title: 'رتّب الحروف', type: 'game', category: 'reading', emoji: '🔤' },
  { id: 'spot-it', title: 'ابحث وجِد!', type: 'game', category: 'logic', emoji: '👁️' },
  { id: 'story-sequence', title: 'تسلسل القصة', type: 'game', category: 'reading', emoji: '📚' },
  { id: 'letters-test', title: 'اختبار الحروف', type: 'test', category: 'reading', emoji: '📖' },
  { id: 'numbers-test', title: 'اختبار الأعداد', type: 'test', category: 'math', emoji: '🔢' },
  {
    id: 'short-memory-test',
    title: 'اختبار الذاكرة القصيرة',
    type: 'test',
    category: 'memory',
    emoji: '🧠',
  },
  {
    id: 'listening-test',
    title: 'اختبار الاستماع',
    type: 'test',
    category: 'listening',
    emoji: '🎧',
  },
  { id: 'writing-test', title: 'اختبار الكتابة', type: 'test', category: 'writing', emoji: '✏️' },
  {
    id: 'logic-test',
    title: 'اختبار التفكير المنطقي',
    type: 'test',
    category: 'logic',
    emoji: '💡',
  },
];
