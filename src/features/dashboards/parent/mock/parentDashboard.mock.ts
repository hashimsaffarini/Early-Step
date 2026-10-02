/**
 * TEMPORARY UI MOCK DATA for the parent dashboard (no backend yet).
 * Delete this file when the dashboard is connected to the API.
 * Values are illustrative only — no diagnoses, risk scores or success rates.
 */
import { HeartHandshake, Repeat, Timer } from 'lucide-react';

import type {
  ParentActivityItem,
  ParentChildSummary,
  ParentDashboardStats,
  ParentTip,
} from '../types';

export const MOCK_PARENT_CHILDREN: readonly ParentChildSummary[] = [
  {
    id: 'mock-child-1',
    name: 'يوسف',
    ageYears: 7,
    status: 'training-plan-active',
    latestAssessmentLabel: 'التقييم المبدئي: مكتمل',
    planProgress: { completed: 3, total: 8 },
  },
  {
    id: 'mock-child-2',
    name: 'نور',
    ageYears: 5,
    status: 'assessment-completed',
    latestAssessmentLabel: 'التقييم المبدئي: مكتمل',
  },
  {
    id: 'mock-child-3',
    name: 'ريم',
    ageYears: 4,
    status: 'assessment-pending',
    latestAssessmentLabel: 'التقييم المبدئي: لم يبدأ بعد',
  },
  {
    id: 'mock-child-4',
    name: 'عمر',
    ageYears: 7,
    status: 'assessment-completed',
    latestAssessmentLabel: 'التقييم المبدئي: مكتمل',
  },
];

export const MOCK_PARENT_STATS: ParentDashboardStats = {
  children: 4,
  completedAssessments: 3,
  trainingPlans: 1,
  reports: 3,
};

export const MOCK_PARENT_ACTIVITY: readonly ParentActivityItem[] = [
  {
    id: 'mock-activity-1',
    kind: 'plan',
    title: 'تم إنشاء خطة تدريبية',
    description: 'خطة جديدة لـ يوسف من الأخصائي',
    date: '2026-09-26',
  },
  {
    id: 'mock-activity-2',
    kind: 'report',
    title: 'تمت إضافة تقرير جديد',
    description: 'تقرير متابعة لـ يوسف',
    date: '2026-09-22',
  },
  {
    id: 'mock-activity-3',
    kind: 'assessment',
    title: 'تم إكمال تقييم مبدئي',
    description: 'أكملت نور التقييم المبدئي',
    date: '2026-09-18',
  },
];

export const PARENT_TIPS: readonly ParentTip[] = [
  {
    id: 'tip-follow-up',
    title: 'المتابعة المنتظمة',
    text: 'المتابعة المنتظمة تساعدك على فهم تطور طفلك بشكل أفضل.',
    icon: Repeat,
    tone: 'primary',
  },
  {
    id: 'tip-short-sessions',
    title: 'جلسات قصيرة وممتعة',
    text: 'الأنشطة القصيرة المتكررة أسهل على الطفل من الجلسات الطويلة.',
    icon: Timer,
    tone: 'success',
  },
  {
    id: 'tip-team',
    title: 'تواصل مع الفريق',
    text: 'شارك ملاحظاتك مع الأخصائي والمعلم عند الحاجة.',
    icon: HeartHandshake,
    tone: 'violet',
  },
];
