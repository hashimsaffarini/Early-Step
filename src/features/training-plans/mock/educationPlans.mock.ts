/**
 * TEMPORARY UI MOCK DATA for the education plans page (no backend yet). Follows the shared
 * roster in docs/MOCK_DATA.md (features can't import each other, so the roster is repeated
 * here). Delete when training plans are connected to the API. Neutral content only — no
 * diagnoses, risk levels or percentages.
 */
import type { AreaRole } from '@/constants/routes';

import type { EducationPlan, PlanChild } from '../types';

const SPECIALIST_NAME = 'أ. ليلى حسن';

const CHILDREN: readonly PlanChild[] = [
  { id: 'mock-child-1', name: 'يوسف' },
  { id: 'mock-child-2', name: 'نور' },
  { id: 'mock-child-3', name: 'ريم' },
  { id: 'mock-child-4', name: 'عمر' },
  { id: 'mock-child-5', name: 'سلمى' },
  { id: 'mock-child-6', name: 'آدم' },
  { id: 'mock-child-7', name: 'ليان' },
];

const VISIBLE_CHILD_IDS: Record<AreaRole, readonly string[]> = {
  Parent: ['mock-child-1', 'mock-child-2', 'mock-child-3', 'mock-child-4'],
  Teacher: ['mock-child-1', 'mock-child-2', 'mock-child-5', 'mock-child-6'],
  Specialist: [
    'mock-child-1',
    'mock-child-2',
    'mock-child-3',
    'mock-child-5',
    'mock-child-6',
    'mock-child-7',
  ],
  Admin: CHILDREN.map((child) => child.id),
};

export function findPlanChild(role: AreaRole, childId: string): PlanChild | undefined {
  if (!VISIBLE_CHILD_IDS[role].includes(childId)) return undefined;
  return CHILDREN.find((child) => child.id === childId);
}

export const MOCK_EDUCATION_PLANS: Readonly<Record<string, readonly EducationPlan[]>> = {
  'mock-child-1': [
    {
      id: 'plan-1',
      title: 'خطة المهارات الأساسية',
      status: 'active',
      specialistName: SPECIALIST_NAME,
      startedAt: '2026-09-26',
      reviewDate: '2026-12-26',
      goals: [
        'التعرّف على الحروف وأصواتها في بداية الكلمات',
        'العدّ وإكمال التسلسلات حتى 20',
        'الاستمرار في النشاط الواحد لمدة أطول',
      ],
      strategies: [
        'أنشطة قصيرة يومية من 10 إلى 15 دقيقة',
        'تقسيم المهمة إلى خطوات صغيرة واضحة',
        'التشجيع بعد كل خطوة منجزة',
      ],
      activitiesCompleted: 3,
      activitiesTotal: 8,
      notes: 'يُفضَّل ممارسة الأنشطة في الوقت نفسه من كل يوم.',
    },
  ],
  'mock-child-5': [
    {
      id: 'plan-2',
      title: 'خطة دعم القراءة',
      status: 'active',
      specialistName: SPECIALIST_NAME,
      startedAt: '2026-09-10',
      reviewDate: '2026-11-10',
      goals: ['قراءة كلمات قصيرة مع الصور', 'ترتيب أحداث قصة بسيطة'],
      strategies: ['القراءة المشتركة مع أحد الوالدين', 'ألعاب الكلمات والصور'],
      activitiesCompleted: 2,
      activitiesTotal: 6,
    },
  ],
  'mock-child-7': [
    {
      id: 'plan-3',
      title: 'خطة التركيز والذاكرة',
      status: 'active',
      specialistName: SPECIALIST_NAME,
      startedAt: '2026-09-01',
      reviewDate: '2026-10-15',
      goals: ['تذكّر تسلسلات قصيرة من الألوان والصور', 'البحث عن التفاصيل في الصور'],
      strategies: ['ألعاب الذاكرة المتدرجة', 'فترات راحة قصيرة بين الأنشطة'],
      activitiesCompleted: 4,
      activitiesTotal: 5,
      notes: 'تُراجَع الخطة مع ولي الأمر في موعد المراجعة.',
    },
    {
      id: 'plan-4',
      title: 'خطة التهيئة',
      status: 'completed',
      specialistName: SPECIALIST_NAME,
      startedAt: '2026-06-01',
      reviewDate: '2026-08-20',
      goals: ['التعرّف على الأنشطة والألعاب'],
      strategies: ['جلسات قصيرة بمرافقة ولي الأمر'],
      activitiesCompleted: 4,
      activitiesTotal: 4,
    },
  ],
};
