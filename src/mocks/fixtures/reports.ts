/** TEMPORARY MOCK DATA — reports table (fictional, neutral content; no strengths field in the API). */
import { registerMockTable } from '../db';

export interface MockReportRow {
  id: string;
  childId: string;
  childName: string;
  title: string;
  weaknesses: string;
  recommendations: string;
  createdAt: string;
  specialistId: string;
  specialistName: string;
}

const INITIAL: readonly MockReportRow[] = [
  {
    id: 'r0000000-0000-4000-8000-000000000001',
    childId: 'c0000000-0000-4000-8000-000000000001',
    childName: 'يوسف',
    title: 'تقرير متابعة',
    weaknesses: 'تمييز الحروف المتشابهة في الشكل.\nالاستمرار في النشاط لفترة أطول.',
    recommendations: 'قراءة قصة مصوّرة 10 دقائق يومياً.\nتكرار لعبة الحروف مرتين في الأسبوع.',
    createdAt: '2026-09-22T09:00:00Z',
    specialistId: 'u-specialist',
    specialistName: 'أ. ليلى حسن',
  },
  {
    id: 'r0000000-0000-4000-8000-000000000002',
    childId: 'c0000000-0000-4000-8000-000000000002',
    childName: 'نور',
    title: 'تقرير التقييم المبدئي',
    weaknesses: 'العدّ بعد الرقم 10.',
    recommendations: 'ألعاب عدّ قصيرة باستخدام أشياء من المنزل.',
    createdAt: '2026-09-20T09:00:00Z',
    specialistId: 'u-specialist',
    specialistName: 'أ. ليلى حسن',
  },
];

export const mockReports: MockReportRow[] = [];

registerMockTable(() => {
  mockReports.splice(0, mockReports.length, ...INITIAL.map((row) => ({ ...row })));
});
