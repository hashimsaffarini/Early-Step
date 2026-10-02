import { MessagesSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { cx } from '@/utils/classNames';

import { ChatThread } from '../components/ChatThread';
import { ConversationList } from '../components/ConversationList';
import { NewConversationDialog } from '../components/NewConversationDialog';
import { getMockContacts, getMockConversations } from '../mock/conversations.mock';
import type { ChatContact, Conversation } from '../types';
import { getConversationButtonId, THREAD_TITLE_ID } from '../utils/chatIds';

import styles from './MessagesPage.module.css';

/**
 * Replit messages screen: conversation list + thread. UI only — conversations are local mock
 * state; sending appends locally (no sockets, nothing persisted). Small screens stack the panes.
 */
export function MessagesPage() {
  const { role } = useRoleArea();
  const [conversations, setConversations] = useState<readonly Conversation[]>(() =>
    getMockConversations(role),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  /** Where focus should go after the next render (thread title or a list item). */
  const pendingFocus = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const active = conversations.find((conversation) => conversation.id === activeId) ?? null;

  const select = (conversationId: string) => {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
    setActiveId(conversationId);
    pendingFocus.current = THREAD_TITLE_ID;
  };

  const back = () => {
    if (activeId) pendingFocus.current = getConversationButtonId(activeId);
    setActiveId(null);
  };

  const send = (text: string) => {
    if (!activeId) return;
    const message = {
      id: `local-${crypto.randomUUID()}`,
      text,
      sentAt: new Date().toISOString(),
      isOwn: true,
    };
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === activeId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation,
      ),
    );
  };

  const startWith = (contact: ChatContact) => {
    const existing = conversations.find((conversation) => conversation.contact.id === contact.id);
    setIsPickerOpen(false);
    if (existing) {
      select(existing.id);
      return;
    }
    const created: Conversation = {
      id: `conversation-${contact.id}`,
      contact,
      messages: [],
      unreadCount: 0,
    };
    setConversations((current) => [created, ...current]);
    setActiveId(created.id);
    pendingFocus.current = THREAD_TITLE_ID;
  };

  return (
    <div className={styles.page}>
      <PageHeader title="الرسائل" subtitle="تواصل مع الأسرة وفريق المتابعة." />

      <div className={styles.layout} data-view={active ? 'thread' : 'list'}>
        <ConversationList
          className={cx(styles.pane, styles.listPane)}
          conversations={conversations}
          activeId={activeId}
          onSelect={select}
          onNewConversation={() => {
            setIsPickerOpen(true);
          }}
        />
        {active ? (
          <ChatThread
            key={active.id}
            className={cx(styles.pane, styles.threadPane)}
            conversation={active}
            onSend={send}
            onBack={back}
          />
        ) : (
          <Card className={cx(styles.pane, styles.threadPane, styles.placeholder)}>
            <EmptyState isBoxed={false} icon={<MessagesSquare />} title="اختر محادثة لتبدأ" />
          </Card>
        )}
      </div>

      <NewConversationDialog
        isOpen={isPickerOpen}
        contacts={getMockContacts(role)}
        onClose={() => {
          setIsPickerOpen(false);
        }}
        onPick={startWith}
      />
    </div>
  );
}
