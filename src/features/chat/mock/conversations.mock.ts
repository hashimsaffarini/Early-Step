/**
 * TEMPORARY UI MOCK DATA for messages (no backend, no sockets). Follows the shared roster in
 * docs/MOCK_DATA.md. Delete when chat is connected to the API.
 */
import type { UserRole } from '@/types/roles';

import type { ChatContact, ChatMessage, Conversation } from '../types';

const CONTACTS = {
  parentMohammed: { id: 'user-parent-1', name: 'محمد أحمد', role: 'Parent' },
  parentKhaled: { id: 'user-parent-2', name: 'خالد يوسف', role: 'Parent' },
  parentAli: { id: 'user-parent-3', name: 'علي حسن', role: 'Parent' },
  parentSami: { id: 'user-parent-4', name: 'سامي محمود', role: 'Parent' },
  teacher: { id: 'user-teacher', name: 'أ. سارة خالد', role: 'Teacher' },
  specialist: { id: 'user-specialist', name: 'أ. ليلى حسن', role: 'Specialist' },
  admin: { id: 'user-admin', name: 'خالد سعيد', role: 'Admin' },
} as const satisfies Record<string, ChatContact>;

type MessageSeed = readonly [isOwn: boolean, sentAt: string, text: string];

function conversation(
  contact: ChatContact,
  unreadCount: number,
  seeds: readonly MessageSeed[],
): Conversation {
  const messages: ChatMessage[] = seeds.map(([isOwn, sentAt, text], index) => ({
    id: `${contact.id}-m${String(index + 1)}`,
    isOwn,
    sentAt,
    text,
  }));
  return { id: `conversation-${contact.id}`, contact, messages, unreadCount };
}

const CONVERSATIONS: Record<UserRole, readonly Conversation[]> = {
  Parent: [
    conversation(CONTACTS.teacher, 2, [
      [true, '2026-09-27T09:10:00', 'صباح الخير أستاذة، كيف كان يوسف في نشاط اليوم؟'],
      [false, '2026-09-28T12:30:00', 'صباح النور! شارك يوسف في لعبة مطابقة البطاقات وأنهاها.'],
      [false, '2026-09-28T12:32:00', 'سأرسل لكم ملاحظات الأسبوع يوم الخميس.'],
    ]),
    conversation(CONTACTS.specialist, 1, [
      [false, '2026-09-26T10:00:00', 'تمت إضافة خطة تدريبية جديدة ليوسف، يمكنكم الاطلاع عليها.'],
      [true, '2026-09-26T18:20:00', 'شكراً جزيلاً، هل هناك نشاط تنصحين به في المنزل؟'],
      [false, '2026-09-27T08:45:00', 'قراءة قصة مصوّرة قصيرة يومياً ستكون مفيدة.'],
    ]),
    conversation(CONTACTS.admin, 0, [
      [false, '2026-09-15T11:00:00', 'أهلاً بكم في Early Step. نحن هنا لأي استفسار.'],
      [true, '2026-09-15T13:05:00', 'شكراً لكم.'],
    ]),
  ],
  Teacher: [
    conversation(CONTACTS.parentMohammed, 1, [
      [false, '2026-09-27T09:10:00', 'صباح الخير أستاذة، كيف كان يوسف في نشاط اليوم؟'],
      [true, '2026-09-28T12:30:00', 'صباح النور! شارك يوسف في لعبة مطابقة البطاقات وأنهاها.'],
      [false, '2026-09-28T19:02:00', 'رائع، شكراً لك!'],
    ]),
    conversation(CONTACTS.parentKhaled, 0, [
      [true, '2026-09-24T10:15:00', 'أنهت سلمى نشاط الأرقام المفقودة اليوم.'],
      [false, '2026-09-24T16:40:00', 'جميل جداً، سنتابع معها في المنزل.'],
    ]),
    conversation(CONTACTS.specialist, 1, [
      [false, '2026-09-25T08:30:00', 'هل يمكنك متابعة أنشطة القراءة مع آدم هذا الأسبوع؟'],
    ]),
  ],
  Specialist: [
    conversation(CONTACTS.parentMohammed, 0, [
      [true, '2026-09-26T10:00:00', 'تمت إضافة خطة تدريبية جديدة ليوسف، يمكنكم الاطلاع عليها.'],
      [false, '2026-09-26T18:20:00', 'شكراً جزيلاً، هل هناك نشاط تنصحين به في المنزل؟'],
      [true, '2026-09-27T08:45:00', 'قراءة قصة مصوّرة قصيرة يومياً ستكون مفيدة.'],
    ]),
    conversation(CONTACTS.teacher, 1, [
      [true, '2026-09-25T08:30:00', 'هل يمكنك متابعة أنشطة القراءة مع آدم هذا الأسبوع؟'],
      [false, '2026-09-25T13:10:00', 'بالتأكيد، سأخبرك بما يحدث.'],
    ]),
    conversation(CONTACTS.parentSami, 2, [
      [false, '2026-09-28T17:00:00', 'مرحباً، اطلعنا على تقرير ليان الأخير.'],
      [false, '2026-09-28T17:02:00', 'متى يمكننا مناقشة الخطة القادمة؟'],
    ]),
  ],
  Admin: [
    conversation(CONTACTS.specialist, 0, [
      [false, '2026-09-20T09:00:00', 'تم رفع تقارير هذا الأسبوع.'],
      [true, '2026-09-20T09:30:00', 'شكراً لك.'],
    ]),
    conversation(CONTACTS.parentMohammed, 1, [
      [true, '2026-09-15T11:00:00', 'أهلاً بكم في Early Step. نحن هنا لأي استفسار.'],
      [false, '2026-09-28T20:15:00', 'هل يمكن إضافة طفل آخر إلى الحساب؟'],
    ]),
  ],
  SuperAdmin: [],
};

/** People each role can start a conversation with (Replit "محادثة جديدة" list). */
const CONTACTS_BY_ROLE: Record<UserRole, readonly ChatContact[]> = {
  Parent: [CONTACTS.teacher, CONTACTS.specialist, CONTACTS.admin],
  Teacher: [
    CONTACTS.parentMohammed,
    CONTACTS.parentKhaled,
    CONTACTS.parentAli,
    CONTACTS.specialist,
  ],
  Specialist: [
    CONTACTS.parentMohammed,
    CONTACTS.parentKhaled,
    CONTACTS.parentAli,
    CONTACTS.parentSami,
    CONTACTS.teacher,
    CONTACTS.admin,
  ],
  Admin: [CONTACTS.parentMohammed, CONTACTS.teacher, CONTACTS.specialist],
  SuperAdmin: [],
};

export function getMockConversations(role: UserRole): readonly Conversation[] {
  return CONVERSATIONS[role];
}

export function getMockContacts(role: UserRole): readonly ChatContact[] {
  return CONTACTS_BY_ROLE[role];
}

/** Unread messages for the sidebar badge (static mock value). */
export function getMockUnreadCount(role: UserRole): number {
  return CONVERSATIONS[role].reduce((total, item) => total + item.unreadCount, 0);
}
