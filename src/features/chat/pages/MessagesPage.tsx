import { MessagesSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { useSession } from '@/services/session';
import { cx } from '@/utils/classNames';

import {
  useChatUsers,
  useConversations,
  useMarkSeen,
  useSendMessage,
  useThreadMessages,
} from '../api/chatQueries';
import { ChatThread } from '../components/ChatThread';
import { ConversationList } from '../components/ConversationList';
import { NewConversationDialog } from '../components/NewConversationDialog';
import type { ActiveThread, ChatContact, ConversationSummary } from '../types';
import { getConversationButtonId, THREAD_TITLE_ID } from '../utils/chatIds';
import { isOwnMessage } from '../utils/messages';

import styles from './MessagesPage.module.css';

function toThread(conversation: ConversationSummary): ActiveThread {
  return {
    kind: 'conversation',
    conversationId: conversation.id,
    contactId: conversation.contactId,
    contactName: conversation.contactName,
  };
}

interface OpenThreadProps {
  thread: ActiveThread;
  contactRole: ChatContact['role'];
  onBack: () => void;
  onCreated: (thread: ActiveThread) => void;
}

/** The open thread: messages (with polling), seen state and sending. */
function OpenThread({ thread, contactRole, onBack, onCreated }: OpenThreadProps) {
  const session = useSession();
  const markSeen = useMarkSeen();
  const { mutate: markSeenMutate } = markSeen;
  const thread$ = useThreadMessages(thread, (conversationId) => {
    markSeenMutate(conversationId);
  });
  const sendMutation = useSendMessage(thread);
  const conversationId = thread.kind === 'conversation' ? thread.conversationId : null;

  useEffect(() => {
    if (conversationId) markSeenMutate(conversationId);
  }, [conversationId, markSeenMutate]);

  return (
    <ChatThread
      className={cx(styles.pane, styles.threadPane)}
      contactName={thread.contactName}
      contactRole={contactRole}
      messages={thread$.messages}
      isOwn={(message) => isOwnMessage(message, session?.user.id ?? null, thread.contactId)}
      isLoading={thread$.isLoading}
      loadError={thread$.error}
      onRetry={thread$.retry}
      hasOlder={thread$.hasOlder}
      isLoadingOlder={thread$.isLoadingOlder}
      onLoadOlder={thread$.loadOlder}
      sendError={sendMutation.error}
      onSend={async (text) => {
        try {
          const sent = await sendMutation.mutateAsync(text);
          if (thread.kind === 'draft' && sent.conversationId) {
            onCreated({
              kind: 'conversation',
              conversationId: sent.conversationId,
              contactId: thread.contactId,
              contactName: thread.contactName,
            });
          }
          return true;
        } catch {
          return false;
        }
      }}
      onBack={onBack}
    />
  );
}

/**
 * Messages: conversation list + thread over the chat REST API. New messages arrive by polling
 * (the SignalR hub is not usable — BLOCKED BY BACKEND). Small screens show list OR thread.
 */
export function MessagesPage() {
  const conversations = useConversations();
  const [active, setActive] = useState<ActiveThread | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const users = useChatUsers(isPickerOpen || active !== null);
  /** Where focus should go after the next render (thread title or a list item). */
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const rows = conversations.data ?? [];
  const activeConversationId = active?.kind === 'conversation' ? active.conversationId : null;
  const contactRole = users.data?.find((user) => user.id === active?.contactId)?.role ?? null;

  const open = (thread: ActiveThread) => {
    setActive(thread);
    pendingFocus.current = THREAD_TITLE_ID;
  };

  const back = () => {
    if (activeConversationId) pendingFocus.current = getConversationButtonId(activeConversationId);
    setActive(null);
  };

  const startWith = (contact: ChatContact) => {
    setIsPickerOpen(false);
    const existing = rows.find((row) => row.contactId === contact.id);
    open(
      existing
        ? toThread(existing)
        : { kind: 'draft', contactId: contact.id, contactName: contact.name },
    );
  };

  return (
    <div className={styles.page}>
      <PageHeader title="الرسائل" subtitle="تواصل مع الأسرة وفريق المتابعة." />

      <div className={styles.layout} data-view={active ? 'thread' : 'list'}>
        <ConversationList
          className={cx(styles.pane, styles.listPane)}
          conversations={rows}
          isLoading={conversations.isPending}
          error={conversations.error}
          onRetry={() => void conversations.refetch()}
          activeId={activeConversationId}
          onSelect={(conversationId) => {
            const row = rows.find((candidate) => candidate.id === conversationId);
            if (row) open(toThread(row));
          }}
          onNewConversation={() => {
            setIsPickerOpen(true);
          }}
        />
        {active ? (
          <OpenThread
            key={
              active.kind === 'conversation' ? active.conversationId : `draft-${active.contactId}`
            }
            thread={active}
            contactRole={contactRole}
            onBack={back}
            onCreated={setActive}
          />
        ) : (
          <Card className={cx(styles.pane, styles.threadPane, styles.placeholder)}>
            <EmptyState isBoxed={false} icon={<MessagesSquare />} title="اختر محادثة لتبدأ" />
          </Card>
        )}
      </div>

      <NewConversationDialog
        isOpen={isPickerOpen}
        contacts={users.data ?? []}
        isLoading={users.isPending}
        error={users.error}
        onClose={() => {
          setIsPickerOpen(false);
        }}
        onPick={startWith}
      />
    </div>
  );
}
