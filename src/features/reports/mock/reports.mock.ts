/**
 * TEMPORARY UI MOCK DATA for reports (no backend yet). Follows the shared roster in
 * docs/MOCK_DATA.md. Delete when reports are connected to the API.
 * Neutral observations only — no diagnoses, risk levels, probabilities or percentages.
 */
import type { AreaRole } from '@/constants/routes';

import type { ChildReport, ReportChildOption } from '../types';

const SPECIALIST = 'أ. ليلى حسن';

export const MOCK_REPORTS: readonly ChildReport[] = [
  {
    id: 'report-1',
    childId: 'mock-child-1',
    childName: 'يوسف',
    type: 'follow-up',
    title: 'تقرير متابعة',
    date: '2026-09-22',
    authorName: SPECIALIST,
    summary: 'ملاحظات عامة حول الأنشطة المنجزة في الخطة وتوصيات للمتابعة المنزلية.',
    strengths: [
      'يُكمل ألعاب الذاكرة بتركيز جيد.',
      'يتفاعل بحماس مع الأنشطة المصوّرة.',
      'يطلب المساعدة عندما يحتاجها.',
    ],
    areasToSupport: ['تمييز الحروف المتشابهة في الشكل.', 'الاستمرار في النشاط لفترة أطول.'],
    recommendations: [
      'تخصيص 10 دقائق يومياً لقراءة قصة مصوّرة معاً.',
      'تكرار لعبة «رتّب الحروف» مرتين في الأسبوع.',
      'مدح الجهد وليس النتيجة فقط.',
    ],
  },
  {
    id: 'report-2',
    childId: 'mock-child-1',
    childName: 'يوسف',
    type: 'initial-assessment',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-12',
    authorName: SPECIALIST,
    summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
    strengths: ['يتذكّر تسلسل الصور القصيرة.', 'يفهم التعليمات البسيطة بسرعة.'],
    areasToSupport: ['العدّ التنازلي.', 'ترتيب أحداث القصة.'],
    recommendations: [
      'البدء بخطة تدريبية تركّز على المهارات الأساسية.',
      'مراجعة التقدّم بعد أربعة أسابيع.',
    ],
  },
  {
    id: 'report-3',
    childId: 'mock-child-2',
    childName: 'نور',
    type: 'initial-assessment',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-20',
    authorName: SPECIALIST,
    summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
    strengths: ['تتعرّف على الألوان والأشكال بسهولة.', 'تستمتع بأنشطة الاستماع.'],
    areasToSupport: ['التركيز في الأنشطة الطويلة.'],
    recommendations: [
      'أنشطة قصيرة متنوعة مع فترات راحة.',
      'اللعب بألعاب الاستماع مع أحد الوالدين.',
    ],
  },
  {
    id: 'report-4',
    childId: 'mock-child-5',
    childName: 'سلمى',
    type: 'follow-up',
    title: 'تقرير متابعة',
    date: '2026-09-24',
    authorName: SPECIALIST,
    summary: 'متابعة الأنشطة المنجزة خلال الأسبوعين الماضيين.',
    strengths: ['تُكمل أنشطة الرياضيات بثقة.', 'تنظّم خطواتها قبل الإجابة.'],
    areasToSupport: ['تكوين جمل كاملة عند الكتابة.'],
    recommendations: [
      'لعبة «تشكيل الجمل» ثلاث مرات أسبوعياً.',
      'تشجيعها على وصف يومها بجملة أو جملتين.',
    ],
  },
  {
    id: 'report-5',
    childId: 'mock-child-6',
    childName: 'آدم',
    type: 'initial-assessment',
    title: 'تقرير التقييم المبدئي',
    date: '2026-09-15',
    authorName: SPECIALIST,
    summary: 'ملخص مراجعة التقييم المبدئي والخطوات القادمة.',
    strengths: ['يحلّ ألغاز الأنماط بسرعة.', 'يحب الأنشطة الحركية القصيرة.'],
    areasToSupport: ['الاستماع حتى نهاية التعليمات.', 'مطابقة الحروف بأصواتها.'],
    recommendations: [
      'إعطاء التعليمات خطوة بخطوة.',
      'أنشطة استماع قصيرة يومياً.',
      'مراجعة التقدّم مع المعلمة بعد أسبوعين.',
    ],
  },
  {
    id: 'report-6',
    childId: 'mock-child-7',
    childName: 'ليان',
    type: 'follow-up',
    title: 'تقرير متابعة',
    date: '2026-09-08',
    authorName: SPECIALIST,
    summary: 'ملاحظات على الأنشطة المنجزة في الخطة التدريبية.',
    strengths: ['تقرأ الكلمات القصيرة بطلاقة.', 'تُكمل الأنشطة حتى النهاية.'],
    areasToSupport: ['ترتيب أحداث القصص الطويلة.'],
    recommendations: ['قراءة قصة قصيرة وسؤالها عن الترتيب.', 'الاستمرار في لعبة «تسلسل القصة».'],
  },
];

/** Children each role can see (docs/MOCK_DATA.md visibility). */
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
  Admin: [
    'mock-child-1',
    'mock-child-2',
    'mock-child-3',
    'mock-child-4',
    'mock-child-5',
    'mock-child-6',
    'mock-child-7',
  ],
};

const CHILD_NAMES: Readonly<Record<string, string>> = {
  'mock-child-1': 'يوسف',
  'mock-child-2': 'نور',
  'mock-child-3': 'ريم',
  'mock-child-4': 'عمر',
  'mock-child-5': 'سلمى',
  'mock-child-6': 'آدم',
  'mock-child-7': 'ليان',
};

/** Display name of the signed-in mock author per role (matches the mock sessions). */
export const MOCK_REPORT_AUTHORS: Record<AreaRole, string> = {
  Parent: 'محمد أحمد',
  Teacher: 'أ. سارة خالد',
  Specialist: 'أ. ليلى حسن',
  Admin: 'خالد سعيد',
};

export function getVisibleReports(role: AreaRole): readonly ChildReport[] {
  const visible = VISIBLE_CHILD_IDS[role];
  return MOCK_REPORTS.filter((report) => visible.includes(report.childId));
}

export function findVisibleReport(role: AreaRole, reportId: string): ChildReport | undefined {
  return getVisibleReports(role).find((report) => report.id === reportId);
}

export function getReportChildOptions(role: AreaRole): readonly ReportChildOption[] {
  return VISIBLE_CHILD_IDS[role].map((id) => ({ id, name: CHILD_NAMES[id] ?? id }));
}
