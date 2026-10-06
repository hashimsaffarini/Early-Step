import { http, HttpResponse, type HttpHandler } from 'msw';

import { mockId, MOCK_USERS, type MockUser } from '../db';
import {
  createMockConversation,
  mockConversations,
  mockMessages,
  type MockConversationRow,
  type MockMessageRow,
} from '../fixtures/chat';
import { apiUrl, badRequest, currentUser, forbidden, notFound, unauthorized } from '../http';

const DEFAULT_TAKE = 30;

function nameOf(id: string): string {
  return MOCK_USERS.find((user) => user.id === id)?.fullName ?? '';
}

/** `MessageResponse` (Swagger). */
function toMessage(row: MockMessageRow) {
  return {
    id: row.id,
    conversationId: row.conversationId,
    senderId: row.senderId,
    senderName: nameOf(row.senderId),
    receiverId: row.receiverId,
    receiverName: nameOf(row.receiverId),
    text: row.text,
    createdAt: row.createdAt,
    status: row.seen ? 'Seen' : 'Sent',
  };
}

function messagesOf(conversationId: string): MockMessageRow[] {
  return mockMessages
    .filter((row) => row.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function otherParticipant(conversation: MockConversationRow, userId: string): string {
  return conversation.participantIds.find((id) => id !== userId) ?? '';
}

function conversationBetween(a: string, b: string): MockConversationRow | undefined {
  return mockConversations.find(
    (row) => row.participantIds.includes(a) && row.participantIds.includes(b),
  );
}

/** The conversation if the user is a participant; otherwise a 404/403 response. */
function participantConversation(
  user: MockUser,
  conversationId: string | null,
): MockConversationRow | Response {
  const conversation = mockConversations.find((row) => row.id === conversationId);
  if (!conversation) return notFound('المحادثة غير موجودة.');
  if (!conversation.participantIds.includes(user.id)) return forbidden();
  return conversation;
}

function take(url: URL): number {
  const value = Number(url.searchParams.get('take'));
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_TAKE;
}

/** Chat endpoints (Swagger `/api/Chats/*`). Mock data only; participants-only access. */
export const chatHandlers: HttpHandler[] = [
  http.get(apiUrl('Chats/conversations'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const rows = mockConversations
      .filter((row) => row.participantIds.includes(user.id))
      .map((row) => {
        const messages = messagesOf(row.id);
        const last = messages.at(-1);
        const otherId = otherParticipant(row, user.id);
        return {
          id: row.id,
          receiverId: otherId,
          receiverName: nameOf(otherId),
          lastMessage: last ? toMessage(last) : null,
          unreadCount: messages.filter((m) => m.receiverId === user.id && !m.seen).length,
        };
      })
      .sort((a, b) =>
        (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''),
      );
    return HttpResponse.json(rows);
  }),

  http.get(apiUrl('Chats'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const conversationId = url.searchParams.get('conversationId');
    const receiverId = url.searchParams.get('receiverId');
    let conversation: MockConversationRow | undefined;
    if (conversationId) {
      const found = participantConversation(user, conversationId);
      if (found instanceof Response) return found;
      conversation = found;
    } else if (receiverId) {
      conversation = conversationBetween(user.id, receiverId);
    } else {
      return badRequest('conversationId أو receiverId مطلوب.');
    }
    if (!conversation) return HttpResponse.json([]);
    return HttpResponse.json(messagesOf(conversation.id).slice(-take(url)).map(toMessage));
  }),

  http.get(apiUrl('Chats/messages/old'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const conversation = participantConversation(user, url.searchParams.get('conversationId'));
    if (conversation instanceof Response) return conversation;
    const messages = messagesOf(conversation.id);
    const index = messages.findIndex((row) => row.id === url.searchParams.get('beforeId'));
    const before = index === -1 ? [] : messages.slice(0, index);
    return HttpResponse.json(before.slice(-take(url)).map(toMessage));
  }),

  http.get(apiUrl('Chats/messages/new'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const url = new URL(request.url);
    const conversation = participantConversation(user, url.searchParams.get('conversationId'));
    if (conversation instanceof Response) return conversation;
    const messages = messagesOf(conversation.id);
    const index = messages.findIndex((row) => row.id === url.searchParams.get('afterId'));
    const after = index === -1 ? [] : messages.slice(index + 1);
    return HttpResponse.json(after.slice(0, take(url)).map(toMessage));
  }),

  http.post(apiUrl('Chats/send'), async ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const body = (await request.json()) as {
      conversationId?: string | null;
      receiverId?: string;
      text?: string;
    };
    const text = body.text?.trim() ?? '';
    if (!text || !body.receiverId) return badRequest('نص الرسالة والمستلم مطلوبان.');
    if (!MOCK_USERS.some((candidate) => candidate.id === body.receiverId)) {
      return notFound('المستخدم غير موجود.');
    }
    let conversation: MockConversationRow;
    if (body.conversationId) {
      const found = participantConversation(user, body.conversationId);
      if (found instanceof Response) return found;
      conversation = found;
    } else {
      conversation =
        conversationBetween(user.id, body.receiverId) ??
        createMockConversation(user.id, body.receiverId);
    }
    const row: MockMessageRow = {
      id: mockId(),
      conversationId: conversation.id,
      senderId: user.id,
      receiverId: body.receiverId,
      text,
      createdAt: new Date().toISOString(),
      seen: false,
    };
    mockMessages.push(row);
    return HttpResponse.json(toMessage(row));
  }),

  http.get(apiUrl('Chats/unread-count'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(
      mockMessages.filter((m) => m.receiverId === user.id && !m.seen).length,
    );
  }),

  http.post(apiUrl('Chats/mark-conversation-seen'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    const conversation = participantConversation(
      user,
      new URL(request.url).searchParams.get('conversationId'),
    );
    if (conversation instanceof Response) return conversation;
    for (const row of mockMessages) {
      if (row.conversationId === conversation.id && row.receiverId === user.id) row.seen = true;
    }
    return HttpResponse.json(true);
  }),

  http.get(apiUrl('Chats/users'), ({ request }) => {
    const user = currentUser(request);
    if (!user) return unauthorized();
    return HttpResponse.json(
      MOCK_USERS.filter(
        (candidate) => candidate.id !== user.id && candidate.role !== 'SuperAdmin',
      ).map((candidate) => ({
        id: candidate.id,
        name: candidate.fullName,
        role: candidate.roleValue,
      })),
    );
  }),
];
