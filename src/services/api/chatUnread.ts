import { httpClient } from '@/services/http/httpClient';
import { AppError } from '@/services/http/apiError';

/**
 * `GET Chats/unread-count` → int32 (Swagger). Lives in the shared layer because the shell's
 * sidebar badge needs it on every page; kept dependency-free so it stays in the main bundle
 * without pulling the chat feature or Zod.
 */
export async function fetchUnreadMessagesCount(): Promise<number> {
  const { data } = await httpClient.get<unknown>('Chats/unread-count');
  if (typeof data !== 'number' || !Number.isFinite(data)) {
    throw new AppError('استجابة غير متوقعة من الخادم.', { kind: 'unknown' });
  }
  return data;
}
