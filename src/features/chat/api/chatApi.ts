import { z } from 'zod';

import { normalizeRole } from '@/constants/backendRoles';
import { httpClient } from '@/services/http/httpClient';

import type { ChatContact, ChatMessage, ConversationSummary } from '../types';

/**
 * Chat REST API (Swagger: `/api/Chats/*`, response schemas documented there).
 * NOT LIVE-VERIFIED (no working account yet). Real-time hub: BLOCKED BY BACKEND (hub URL and
 * events undocumented) — the UI refreshes by polling `Chats/messages/new` and `Chats/unread-count`.
 */
export const CHAT_PATHS = {
  conversations: 'Chats/conversations',
  messages: 'Chats',
  older: 'Chats/messages/old',
  newer: 'Chats/messages/new',
  send: 'Chats/send',
  unreadCount: 'Chats/unread-count',
  markSeen: 'Chats/mark-conversation-seen',
  users: 'Chats/users',
} as const;

const messageSchema = z.looseObject({
  id: z.string(),
  conversationId: z.string().nullish(),
  senderId: z.string(),
  senderName: z.string().nullish(),
  receiverId: z.string(),
  receiverName: z.string().nullish(),
  text: z.string().nullish(),
  createdAt: z.string(),
  status: z.string().nullish(),
});

const conversationSchema = z.looseObject({
  id: z.string(),
  receiverId: z.string(),
  receiverName: z.string().nullish(),
  lastMessage: messageSchema.nullish(),
  unreadCount: z.number().nullish(),
});

const chatUserSchema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
  role: z.string().nullish(),
});

export function mapMessage(dto: z.infer<typeof messageSchema>): ChatMessage {
  return {
    id: dto.id,
    conversationId: dto.conversationId ?? null,
    senderId: dto.senderId,
    receiverId: dto.receiverId,
    text: dto.text ?? '',
    sentAt: dto.createdAt,
    status: dto.status ?? null,
  };
}

function mapConversation(dto: z.infer<typeof conversationSchema>): ConversationSummary {
  return {
    id: dto.id,
    contactId: dto.receiverId,
    contactName: dto.receiverName ?? '',
    lastMessage: dto.lastMessage ? mapMessage(dto.lastMessage) : null,
    unreadCount: dto.unreadCount ?? 0,
  };
}

const messageListSchema = z.array(messageSchema);

/** Page size for opening a thread and for "older messages". */
export const MESSAGE_PAGE_SIZE = 30;

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const { data } = await httpClient.get<unknown>(CHAT_PATHS.conversations);
  return z.array(conversationSchema).parse(data).map(mapConversation);
}

/** Opens a thread by conversation id, or by receiver for a conversation that may not exist yet. */
export async function fetchMessages(params: {
  conversationId?: string | undefined;
  receiverId?: string | undefined;
}): Promise<ChatMessage[]> {
  const { data } = await httpClient.get<unknown>(CHAT_PATHS.messages, {
    params: { ...params, take: MESSAGE_PAGE_SIZE },
  });
  return messageListSchema.parse(data).map(mapMessage);
}

export async function fetchOlderMessages(
  conversationId: string,
  beforeId: string,
): Promise<ChatMessage[]> {
  const { data } = await httpClient.get<unknown>(CHAT_PATHS.older, {
    params: { conversationId, beforeId, take: MESSAGE_PAGE_SIZE },
  });
  return messageListSchema.parse(data).map(mapMessage);
}

export async function fetchNewerMessages(
  conversationId: string,
  afterId: string,
): Promise<ChatMessage[]> {
  const { data } = await httpClient.get<unknown>(CHAT_PATHS.newer, {
    params: { conversationId, afterId, take: MESSAGE_PAGE_SIZE },
  });
  return messageListSchema.parse(data).map(mapMessage);
}

export interface SendMessageInput {
  conversationId: string | null;
  receiverId: string;
  text: string;
}

export async function sendMessage(input: SendMessageInput): Promise<ChatMessage> {
  const { data } = await httpClient.post<unknown>(CHAT_PATHS.send, input);
  return mapMessage(messageSchema.parse(data));
}

export async function markConversationSeen(conversationId: string): Promise<void> {
  await httpClient.post(CHAT_PATHS.markSeen, null, { params: { conversationId } });
}

export async function fetchChatUsers(): Promise<ChatContact[]> {
  const { data } = await httpClient.get<unknown>(CHAT_PATHS.users);
  return z
    .array(chatUserSchema)
    .parse(data)
    .map((dto) => ({ id: dto.id, name: dto.name ?? '', role: normalizeRole(dto.role) }));
}
