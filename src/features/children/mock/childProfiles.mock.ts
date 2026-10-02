/**
 * TEMPORARY UI MOCK DATA for child profiles (no backend yet), keyed by the stable
 * mock child ids in `children.mock.ts` (shared roster: docs/MOCK_DATA.md).
 * Delete when the API is integrated. Neutral, illustrative content only — no diagnoses,
 * results, risk scores or percentages.
 */
import type { ChildProfileDetails, PlanActivity } from '../types';

import { ASSIGNABLE_ACTIVITIES } from './assignableActivities.mock';

const INITIAL_ASSESSMENT_TITLE = 'التقييم المبدئي';
const INITIAL_ASSESSMENT_SECTIONS = 4;
const SPECIALIST_NAME = 'أ. ليلى حسن';

/** A plan activity built from the shared game/test catalogue (keeps titles and ids in sync). */
function planActivity(id: string, activityId: string, isCompleted: boolean): PlanActivity {
  const activity = ASSIGNABLE_ACTIVITIES.find((item) => item.id === activityId);
  if (!activity) throw new Error(`Unknown mock activity: ${activityId}`);
  const { title, type, category, emoji } = activity;
  return { id, activityId, title, type, category, emoji, isCompleted };
}

function completedAssessment(id: string, completedAt: string) {
  return {
    id,
    title: INITIAL_ASSESSMENT_TITLE,
    state: 'completed',
    completedAt,
    completedSections: INITIAL_ASSESSMENT_SECTIONS,
    totalSections: INITIAL_ASSESSMENT_SECTIONS,
  } as const;
}

export const MOCK_CHILD_PROFILES: Readonly<Record<string, ChildProfileDetails>> = {
  'mock-child-1': {
    assessments: [completedAssessment('a1', '2026-09-10')],
    plan: {
      title: 'خطة المهارات الأساسية',
      startedAt: '2026-09-26',
      specialistName: SPECIALIST_NAME,
      activities: [
        planActivity('p1', 'memory-match', true),
        planActivity('p2', 'missing-numbers', true),
        planActivity('p3', 'letters-test', true),
        planActivity('p4', 'sentence-builder', false),
        planActivity('p5', 'listen-choose', false),
        planActivity('p6', 'numbers-test', false),
        planActivity('p7', 'story-sequence', false),
        planActivity('p8', 'short-memory-test', false),
      ],
    },
    reports: [
      {
        id: 'report-1',
        title: 'تقرير متابعة',
        date: '2026-09-22',
        authorName: SPECIALIST_NAME,
        summary: 'ملاحظات عامة حول الأنشطة المنجزة وتوصيات للمتابعة المنزلية.',
      },
      {
        id: 'report-2',
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
    assessments: [completedAssessment('a2', '2026-09-18')],
    reports: [
      {
        id: 'report-3',
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
    assessments: [completedAssessment('a4', '2026-09-05')],
    reports: [],
    events: [
      { id: 'e7', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-05' },
    ],
  },
  'mock-child-5': {
    assessments: [completedAssessment('a5', '2026-09-03')],
    plan: {
      title: 'خطة دعم القراءة',
      startedAt: '2026-09-10',
      specialistName: SPECIALIST_NAME,
      activities: [
        planActivity('p9', 'word-reading', true),
        planActivity('p10', 'letters-test', true),
        planActivity('p11', 'word-scramble', false),
        planActivity('p12', 'story-sequence', false),
        planActivity('p13', 'sentence-builder', false),
        planActivity('p14', 'writing-test', false),
      ],
    },
    reports: [
      {
        id: 'report-4',
        title: 'تقرير متابعة',
        date: '2026-09-24',
        authorName: SPECIALIST_NAME,
        summary: 'ملاحظات حول أنشطة القراءة المنجزة واقتراحات للتدريب في المنزل.',
      },
    ],
    events: [
      { id: 'e8', kind: 'report', title: 'تمت إضافة تقرير جديد', date: '2026-09-24' },
      { id: 'e9', kind: 'plan', title: 'تمت إضافة خطة تدريبية', date: '2026-09-10' },
      { id: 'e10', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-03' },
    ],
  },
  'mock-child-6': {
    assessments: [completedAssessment('a6', '2026-09-13')],
    reports: [
      {
        id: 'report-5',
        title: 'تقرير التقييم المبدئي',
        date: '2026-09-15',
        authorName: SPECIALIST_NAME,
        summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
      },
    ],
    events: [
      { id: 'e11', kind: 'report', title: 'تمت إضافة تقرير جديد', date: '2026-09-15' },
      { id: 'e12', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-09-13' },
    ],
  },
  'mock-child-7': {
    assessments: [completedAssessment('a7', '2026-08-25')],
    plan: {
      title: 'خطة التركيز والذاكرة',
      startedAt: '2026-09-01',
      specialistName: SPECIALIST_NAME,
      activities: [
        planActivity('p15', 'color-memory', true),
        planActivity('p16', 'memory-match', true),
        planActivity('p17', 'spot-it', true),
        planActivity('p18', 'short-memory-test', true),
        planActivity('p19', 'pattern-logic', false),
      ],
    },
    reports: [
      {
        id: 'report-6',
        title: 'تقرير متابعة',
        date: '2026-09-08',
        authorName: SPECIALIST_NAME,
        summary: 'ملاحظات حول أنشطة الذاكرة والانتباه وتوصيات للمرحلة القادمة.',
      },
    ],
    events: [
      { id: 'e13', kind: 'report', title: 'تمت إضافة تقرير جديد', date: '2026-09-08' },
      { id: 'e14', kind: 'plan', title: 'تمت إضافة خطة تدريبية', date: '2026-09-01' },
      { id: 'e15', kind: 'assessment', title: 'تم إكمال التقييم المبدئي', date: '2026-08-25' },
    ],
  },
};

/** Profile shown for children added locally in this session (nothing has happened yet). */
export const EMPTY_CHILD_PROFILE: ChildProfileDetails = {
  assessments: [{ id: 'local-initial', title: INITIAL_ASSESSMENT_TITLE, state: 'not-started' }],
  reports: [],
  events: [],
};
