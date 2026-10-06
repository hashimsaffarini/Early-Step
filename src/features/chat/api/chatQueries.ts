import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { queryKeys } from '@/services/api/queryKeys';
import { useSession } from '@/services/session';

import type { ActiveThread, ChatMessage, ConversationSummary } from '../types';
import { firstConfirmedId, lastConfirmedId, mergeMessages } from '../utils/messages';

import {
  fetchChatUsers,
  fetchConversations,
  fetchMessages,
  fetchNewerMessages,
  fetchOlderMessages,
  markConversationSeen,
  MESSAGE_PAGE_SIZE,
  sendMessage,
} from './chatApi';

/** Polling intervals — the documented SignalR hub is not usable (BLOCKED BY BACKEND). */
export const CHAT_POLL_MS = {
  messages: 7_000,
  conversations: 30_000,
} as const;

/** Messages cache key: by conversation id, or by receiver for a conversation not created yet. */
export function threadKey(thread: ActiveThread): QueryKey {
  return thread.kind === 'conversation'
    ? queryKeys.chat.messages(thread.conversationId)
    : [...queryKeys.chat.all, 'receiver', thread.contactId];
}

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.chat.conversations(),
    queryFn: fetchConversations,
    refetchInterval: CHAT_POLL_MS.conversations,
    refetchIntervalInBackground: false,
  });
}

export function useChatUsers(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.chat.users(), queryFn: fetchChatUsers, enabled });
}

/** Marks a conversation seen; refreshes the unread badge and zeroes its row immediately. */
export function useMarkSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationSeen,
    onMutate: (conversationId) => {
      queryClient.setQueryData<ConversationSummary[]>(queryKeys.chat.conversations(), (current) =>
        current?.map((row) => (row.id === conversationId ? { ...row, unreadCount: 0 } : row)),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.unread() });
    },
  });
}

export interface ThreadMessages {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  retry: () => void;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => void;
}

/**
 * Messages of the open thread: first page, "older" pages on demand, and polling for new
 * messages while the tab is visible. `onIncoming` fires when polling brings messages from the
 * other participant (used to mark the conversation seen).
 */
export function useThreadMessages(
  thread: ActiveThread,
  onIncoming: (conversationId: string) => void,
): ThreadMessages {
  const queryClient = useQueryClient();
  const key = threadKey(thread);
  const conversationId = thread.kind === 'conversation' ? thread.conversationId : null;
  const [olderState, setOlderState] = useState({ key: '', exhausted: false, loading: false });
  const keyString = JSON.stringify(key);

  const query = useQuery({
    queryKey: key,
    queryFn: async () =>
      mergeMessages(
        [],
        await fetchMessages(conversationId ? { conversationId } : { receiverId: thread.contactId }),
      ),
    staleTime: Infinity,
  });

  const onIncomingRef = useRef(onIncoming);
  useEffect(() => {
    onIncomingRef.current = onIncoming;
  });

  const hasData = query.data !== undefined;
  useEffect(() => {
    if (!conversationId || !hasData) return undefined;
    let isActive = true;
    const poll = async () => {
      if (document.visibilityState === 'hidden') return;
      const current = queryClient.getQueryData<ChatMessage[]>(key) ?? [];
      const afterId = lastConfirmedId(current);
      if (!afterId) return;
      try {
        const incoming = await fetchNewerMessages(conversationId, afterId);
        if (!isActive || incoming.length === 0) return;
        queryClient.setQueryData<ChatMessage[]>(key, (latest) =>
          mergeMessages(latest ?? [], incoming),
        );
        if (incoming.some((message) => message.senderId === thread.contactId)) {
          onIncomingRef.current(conversationId);
        }
      } catch {
        // Polling errors are transient; the next tick retries.
      }
    };
    const timer = window.setInterval(() => void poll(), CHAT_POLL_MS.messages);
    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
    // `key` is derived from `keyString`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, hasData, keyString, queryClient, thread.contactId]);

  const exhausted =
    olderState.key === keyString
      ? olderState.exhausted
      : (query.data?.length ?? 0) < MESSAGE_PAGE_SIZE;

  const loadOlder = useCallback(() => {
    const current = queryClient.getQueryData<ChatMessage[]>(key) ?? [];
    const beforeId = firstConfirmedId(current);
    if (!conversationId || !beforeId) return;
    setOlderState({ key: keyString, exhausted: false, loading: true });
    fetchOlderMessages(conversationId, beforeId)
      .then((older) => {
        queryClient.setQueryData<ChatMessage[]>(key, (latest) =>
          mergeMessages(latest ?? [], older),
        );
        setOlderState({
          key: keyString,
          exhausted: older.length < MESSAGE_PAGE_SIZE,
          loading: false,
        });
      })
      .catch(() => {
        setOlderState({ key: keyString, exhausted: false, loading: false });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, keyString, queryClient]);

  return {
    messages: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
    retry: () => void query.refetch(),
    hasOlder: Boolean(conversationId) && !exhausted,
    isLoadingOlder: olderState.key === keyString && olderState.loading,
    loadOlder,
  };
}

/**
 * Sends a message with an optimistic bubble. On success the server message replaces it (no
 * duplicate even if polling already returned it); on error the bubble is removed and the
 * error returned to the caller.
 */
export function useSendMessage(thread: ActiveThread) {
  const queryClient = useQueryClient();
  const session = useSession();
  const key = threadKey(thread);
  return useMutation({
    mutationFn: (text: string) =>
      sendMessage({
        conversationId: thread.kind === 'conversation' ? thread.conversationId : null,
        receiverId: thread.contactId,
        text,
      }),
    onMutate: (text) => {
      const optimistic: ChatMessage = {
        id: `pending-${crypto.randomUUID()}`,
        conversationId: thread.kind === 'conversation' ? thread.conversationId : null,
        senderId: session?.user.id ?? '',
        receiverId: thread.contactId,
        text,
        sentAt: new Date().toISOString(),
        status: null,
        pending: true,
      };
      queryClient.setQueryData<ChatMessage[]>(key, (current) =>
        mergeMessages(current ?? [], [optimistic]),
      );
      return { optimisticId: optimistic.id };
    },
    onError: (_error, _text, context) => {
      queryClient.setQueryData<ChatMessage[]>(key, (current) =>
        (current ?? []).filter((message) => message.id !== context?.optimisticId),
      );
    },
    onSuccess: (sent, _text, context) => {
      const merged = mergeMessages(
        queryClient.getQueryData<ChatMessage[]>(key) ?? [],
        [sent],
        context.optimisticId,
      );
      queryClient.setQueryData<ChatMessage[]>(key, merged);
      // A new conversation: seed its own cache entry under the id the server assigned.
      if (thread.kind === 'draft' && sent.conversationId) {
        queryClient.setQueryData<ChatMessage[]>(
          queryKeys.chat.messages(sent.conversationId),
          merged,
        );
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations() });
    },
  });
}
