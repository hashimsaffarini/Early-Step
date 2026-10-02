/**
 * TEMPORARY UI MOCK DATA — admin "آخر النشاطات" (no backend yet). Follows docs/MOCK_DATA.md.
 */
import type { ParentActivityItem } from '@/features/dashboards/parent/types';

export const MOCK_ADMIN_ACTIVITY: readonly ParentActivityItem[] = [
  {
    id: 'admin-activity-1',
    kind: 'plan',
    title: 'تمت إضافة خطة تدريبية',
    description: 'خطة جديدة لـ يوسف من أ. ليلى حسن',
    date: '2026-09-26',
  },
  {
    id: 'admin-activity-2',
    kind: 'report',
    title: 'تمت إضافة تقرير جديد',
    description: 'تقرير متابعة لـ سلمى',
    date: '2026-09-24',
  },
  {
    id: 'admin-activity-3',
    kind: 'report',
    title: 'تمت إضافة تقرير جديد',
    description: 'تقرير متابعة لـ يوسف',
    date: '2026-09-22',
  },
  {
    id: 'admin-activity-4',
    kind: 'assessment',
    title: 'تم إكمال تقييم مبدئي',
    description: 'أكملت نور التقييم المبدئي',
    date: '2026-09-18',
  },
];
