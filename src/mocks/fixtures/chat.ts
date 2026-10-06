/**
 * TEMPORARY MOCK DATA — chat conversations between the fictional mock users
 * (tests + development mock mode). Mutable via the chat handlers; reset per test.
 */
import { mockId, registerMockTable } from '../db';

export interface MockConversationRow {
  id: string;
  participantIds: readonly [string, string];
}

export interface MockMessageRow {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  seen: boolean;
}

export const PARENT_TEACHER_CONVERSATION = 'd0000000-0000-4000-8000-000000000001';
export const PARENT_SPECIALIST_CONVERSATION = 'd0000000-0000-4000-8000-000000000002';

const INITIAL_CONVERSATIONS: readonly MockConversationRow[] = [
  { id: PARENT_TEACHER_CONVERSATION, participantIds: ['u-parent', 'u-teacher'] },
  { id: PARENT_SPECIALIST_CONVERSATION, participantIds: ['u-parent', 'u-specialist'] },
];

const INITIAL_MESSAGES: readonly MockMessageRow[] = [
  {
    id: 'e0000000-0000-4000-8000-000000000001',
    conversationId: PARENT_TEACHER_CONVERSATION,
    senderId: 'u-parent',
    receiverId: 'u-teacher',
    text: 'صباح الخير أستاذة، كيف كان يوسف في نشاط اليوم؟',
    createdAt: '2026-09-27T06:10:00Z',
    seen: true,
  },
  {
    id: 'e0000000-0000-4000-8000-000000000002',
    conversationId: PARENT_TEACHER_CONVERSATION,
    senderId: 'u-teacher',
    receiverId: 'u-parent',
    text: 'صباح النور! شارك يوسف في لعبة مطابقة البطاقات وأنهاها.',
    createdAt: '2026-09-28T09:30:00Z',
    seen: true,
  },
  {
    id: 'e0000000-0000-4000-8000-000000000003',
    conversationId: PARENT_TEACHER_CONVERSATION,
    senderId: 'u-teacher',
    receiverId: 'u-parent',
    text: 'سأرسل لكم ملاحظات الأسبوع يوم الخميس.',
    createdAt: '2026-09-28T09:32:00Z',
    seen: false,
  },
  {
    id: 'e0000000-0000-4000-8000-000000000004',
    conversationId: PARENT_SPECIALIST_CONVERSATION,
    senderId: 'u-specialist',
    receiverId: 'u-parent',
    text: 'قراءة قصة مصوّرة قصيرة يومياً ستكون مفيدة.',
    createdAt: '2026-09-27T05:45:00Z',
    seen: false,
  },
];

export const mockConversations: MockConversationRow[] = [];
export const mockMessages: MockMessageRow[] = [];

registerMockTable(() => {
  mockConversations.splice(0, mockConversations.length, ...INITIAL_CONVERSATIONS);
  mockMessages.splice(0, mockMessages.length, ...INITIAL_MESSAGES.map((row) => ({ ...row })));
});

export function createMockConversation(a: string, b: string): MockConversationRow {
  const row: MockConversationRow = { id: mockId(), participantIds: [a, b] };
  mockConversations.push(row);
  return row;
}
