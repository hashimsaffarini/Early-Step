import type { ChatMessage } from '../types';

function byTime(a: ChatMessage, b: ChatMessage): number {
  const delta = Date.parse(a.sentAt) - Date.parse(b.sentAt);
  return delta !== 0 ? delta : a.id.localeCompare(b.id);
}

/**
 * Merges message batches without duplicates (by id; a confirmed message replaces its optimistic
 * copy via `replacesId`) and keeps a stable chronological order.
 */
export function mergeMessages(
  existing: readonly ChatMessage[],
  incoming: readonly ChatMessage[],
  replacesId?: string,
): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const message of existing) {
    if (message.id !== replacesId) byId.set(message.id, message);
  }
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort(byTime);
}

/** Last confirmed (non-pending) message id — the cursor for `Chats/messages/new`. */
export function lastConfirmedId(messages: readonly ChatMessage[]): string | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message && !message.pending) return message.id;
  }
  return null;
}

/** First confirmed message id — the cursor for `Chats/messages/old`. */
export function firstConfirmedId(messages: readonly ChatMessage[]): string | null {
  return messages.find((message) => !message.pending)?.id ?? null;
}

/** Own message? Compares with the session user id (always sent by `GET Auth/me`). */
export function isOwnMessage(message: ChatMessage, currentUserId: string): boolean {
  return message.pending === true || message.senderId === currentUserId;
}
