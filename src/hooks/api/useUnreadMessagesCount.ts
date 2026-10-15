import { useQuery } from '@tanstack/react-query';

import { fetchUnreadMessagesCount } from '@/services/api/chatUnread';
import { queryKeys } from '@/services/api/queryKeys';
import { useSession } from '@/services/session';

const UNREAD_POLL_MS = 30_000;

/** Unread total for the sidebar badge. Polls only while signed in, visible, and `enabled`. */
export function useUnreadMessagesCount(enabled = true): number {
  const session = useSession();
  const { data } = useQuery({
    queryKey: queryKeys.chat.unread(),
    queryFn: fetchUnreadMessagesCount,
    enabled: enabled && session !== null,
    refetchInterval: UNREAD_POLL_MS,
    refetchIntervalInBackground: false,
  });
  return data ?? 0;
}
