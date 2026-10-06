import type { UserRole } from '@/types/roles';

/** A user the signed-in user can chat with (`GET Chats/users`). */
export interface ChatContact {
  id: string;
  name: string;
  /** Normalized role; null when the backend value is unknown. */
  role: UserRole | null;
}

/** A message (`MessageResponse`). `pending` = optimistic, not yet confirmed by the server. */
export interface ChatMessage {
  id: string;
  conversationId: string | null;
  senderId: string;
  receiverId: string;
  text: string;
  /** ISO date-time (`createdAt`). */
  sentAt: string;
  status: string | null;
  pending?: boolean;
}

/** A conversation row (`ConversationResponse`). `contactId` = the other participant. */
export interface ConversationSummary {
  id: string;
  contactId: string;
  contactName: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

/** The thread on screen: an existing conversation, or a new one not created yet (no id). */
export type ActiveThread =
  | { kind: 'conversation'; conversationId: string; contactId: string; contactName: string }
  | { kind: 'draft'; contactId: string; contactName: string };
