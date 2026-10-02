import type { UserRole } from '@/types/roles';

export interface ChatContact {
  id: string;
  name: string;
  role: UserRole;
}

export interface ChatMessage {
  id: string;
  text: string;
  /** ISO date-time. */
  sentAt: string;
  /** Sent by the signed-in (mock) user — shown on the inline-end. */
  isOwn: boolean;
}

export interface Conversation {
  id: string;
  contact: ChatContact;
  messages: readonly ChatMessage[];
  unreadCount: number;
}
