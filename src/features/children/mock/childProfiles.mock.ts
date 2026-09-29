/**
 * TEMPORARY UI MOCK DATA for child profiles (no backend yet), keyed by the stable
 * mock child IDs in `parentChildren.mock.ts`. Delete when the API is integrated.
 * Neutral, illustrative content only — no diagnoses, results, risk scores or percentages.
 */
import type { ChildProfileDetails } from '../types';

const INITIAL_ASSESSMENT_TITLE = 'التقييم المبدئي';
const INITIAL_ASSESSMENT_SECTIONS = 4;
const SPECIALIST_NAME = 'أ. ليلى حسن';

export const MOCK_CHILD_PROFILES: Readonly<Record<string, ChildProfileDetails>> = {
  'mock-child-1': {
    assessments: [
      {
        id: 'a1',
        title: INITIAL_ASSESSMENT_TITLE,
        state: 'completed',
        completedAt: '2026-09-10',
        completedSections: INITIAL_ASSESSMENT_SECTIONS,
        totalSections: INITIAL_ASSESSMENT_SECTIONS,
      },
    ],
    plan: {
      title: 'خطة المهارات الأساسية',
      startedAt: '2026-09-26',
      specialistName: SPECIALIST_NAME,
      activities: [
        {
          id: 'p1',
          title: 'مطابقة البطاقات',
          type: 'game',
          category: 'الذاكرة',
          isCompleted: true,
        },
        {
          id: 'p2',
          title: 'الأرقام المفقودة',
          type: 'game',
          category: 'الرياضيات',
          isCompleted: true,
        },
        { id: 'p3', title: 'اختبار الحروف', type: 'test', category: 'القراءة', isCompleted: true },
        { id: 'p4', title: 'تشكيل الجمل', type: 'game', category: 'الكتابة', isCompleted: false },
        { id: 'p5', title: 'استمع واختر', type: 'game', category: 'الاستماع', isCompleted: false },
        {
          id: 'p6',
          title: 'اختبار الأعداد',
          type: 'test',
          category: 'الرياضيات',
          isCompleted: false,
        },
        { id: 'p7', title: 'تسلسل القصة', type: 'game', category: 'القراءة', isCompleted: false },
        {
          id: 'p8',
          title: 'اختبار الذاكرة القصيرة',
          type: 'test',
          category: 'الذاكرة',
          isCompleted: false,
        },
      ],
    },
    reports: [
      {
        id: 'r1',
        title: 'تقرير متابعة',
        date: '2026-09-22',
        authorName: SPECIALIST_NAME,
        summary: 'ملاحظات عامة حول الأنشطة المنجزة وتوصيات للمتابعة المنزلية.',
      },
      {
        id: 'r2',
        title: 'تقرير التقييم المبدئي',
        date: '2026-09-12',
        authorName: SPECIALIST_NAME,
        summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
      },
    ],
    events: [
      { id: 'e1', kind: 'plan', title: 'تمت إضافة خطة تدريبية', date: '2026-09-26' },
      { id: 'e2', kind: 'report', title: 'تمت إضافة تقرير جديد', date: '2026-09-22' },
      { id: 'e3', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-10' },
    ],
  },
  'mock-child-2': {
    assessments: [
      {
        id: 'a2',
        title: INITIAL_ASSESSMENT_TITLE,
        state: 'completed',
        completedAt: '2026-09-18',
        completedSections: INITIAL_ASSESSMENT_SECTIONS,
        totalSections: INITIAL_ASSESSMENT_SECTIONS,
      },
    ],
    reports: [
      {
        id: 'r3',
        title: 'تقرير التقييم المبدئي',
        date: '2026-09-20',
        authorName: SPECIALIST_NAME,
        summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
      },
    ],
    events: [
      { id: 'e4', kind: 'report', title: 'تمت إضافة تقرير جديد', date: '2026-09-20' },
      { id: 'e5', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-18' },
    ],
  },
  'mock-child-3': {
    assessments: [{ id: 'a3', title: INITIAL_ASSESSMENT_TITLE, state: 'not-started' }],
    reports: [],
    events: [{ id: 'e6', kind: 'profile', title: 'تمت إضافة ملف الطفل', date: '2026-09-15' }],
  },
  'mock-child-4': {
    assessments: [
      {
        id: 'a4',
        title: INITIAL_ASSESSMENT_TITLE,
        state: 'completed',
        completedAt: '2026-09-05',
        completedSections: INITIAL_ASSESSMENT_SECTIONS,
        totalSections: INITIAL_ASSESSMENT_SECTIONS,
      },
    ],
    reports: [],
    events: [
      { id: 'e7', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-05' },
    ],
  },
};

/** Profile shown for children added locally in this session (nothing has happened yet). */
export const EMPTY_CHILD_PROFILE: ChildProfileDetails = {
  assessments: [{ id: 'local-initial', title: INITIAL_ASSESSMENT_TITLE, state: 'not-started' }],
  reports: [],
  events: [],
};
