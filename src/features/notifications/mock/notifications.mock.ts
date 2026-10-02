/**
 * TEMPORARY UI MOCK DATA for the notifications menu (no backend). Follows docs/MOCK_DATA.md.
 * Delete when notifications come from the API (if they become a requirement).
 */
import type { UserRole } from '@/types/roles';

import type { AppNotification } from '../types';

const MOCK_NOTIFICATIONS: Record<UserRole, readonly AppNotification[]> = {
  Parent: [
    {
      id: 'n-parent-1',
      type: 'report',
      title: 'تقرير جديد',
      body: 'أضافت أ. ليلى حسن تقرير متابعة لـ يوسف.',
      createdAt: '2026-09-22T10:00:00',
      isRead: false,
    },
    {
      id: 'n-parent-2',
      type: 'plan',
      title: 'خطة تدريبية جديدة',
      body: 'تمت إضافة «خطة المهارات الأساسية» لـ يوسف.',
      createdAt: '2026-09-26T09:30:00',
      isRead: false,
    },
    {
      id: 'n-parent-3',
      type: 'message',
      title: 'رسالة جديدة',
      body: 'أرسلت أ. سارة خالد رسالة جديدة.',
      createdAt: '2026-09-28T12:32:00',
      isRead: true,
    },
  ],
  Teacher: [
    {
      id: 'n-teacher-1',
      type: 'message',
      title: 'رسالة جديدة',
      body: 'أرسل محمد أحمد رسالة جديدة.',
      createdAt: '2026-09-28T19:02:00',
      isRead: false,
    },
    {
      id: 'n-teacher-2',
      type: 'info',
      title: 'طفل جديد في قائمتك',
      body: 'أصبح آدم ضمن الأطفال الذين تتابعهم.',
      createdAt: '2026-09-18T08:00:00',
      isRead: true,
    },
  ],
  Specialist: [
    {
      id: 'n-specialist-1',
      type: 'info',
      title: 'تقييم مبدئي مكتمل',
      body: 'أكمل آدم التقييم المبدئي ويمكن مراجعته.',
      createdAt: '2026-09-14T15:20:00',
      isRead: false,
    },
    {
      id: 'n-specialist-2',
      type: 'message',
      title: 'رسالة جديدة',
      body: 'أرسل سامي محمود رسالتين جديدتين.',
      createdAt: '2026-09-28T17:02:00',
      isRead: false,
    },
  ],
  Admin: [
    {
      id: 'n-admin-1',
      type: 'info',
      title: 'حساب جديد',
      body: 'سجّل ولي أمر جديد في المنصة.',
      createdAt: '2026-09-27T11:45:00',
      isRead: false,
    },
  ],
  SuperAdmin: [
    {
      id: 'n-super-1',
      type: 'info',
      title: 'ملخص الأسبوع جاهز',
      body: 'يمكنك مراجعة أعداد المستخدمين والأطفال من لوحة التحكم.',
      createdAt: '2026-09-28T08:00:00',
      isRead: false,
    },
  ],
};

export function getMockNotifications(role: UserRole): readonly AppNotification[] {
  return MOCK_NOTIFICATIONS[role];
}
