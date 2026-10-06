import { MessageCircle, SquarePen } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { cx } from '@/utils/classNames';

import type { ConversationSummary } from '../types';
import { getConversationButtonId } from '../utils/chatIds';
import { formatMessageDay } from '../utils/chatTime';

import styles from './ConversationList.module.css';

const NEW_CONVERSATION = 'محادثة جديدة';

export interface ConversationListProps {
  conversations: readonly ConversationSummary[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  activeId: string | null;
  onSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  className?: string | undefined;
}

/** Replit conversation list, plus a per-conversation unread badge (missing in Replit). */
export function ConversationList({
  conversations,
  isLoading,
  error,
  onRetry,
  activeId,
  onSelect,
  onNewConversation,
  className,
}: ConversationListProps) {
  return (
    <Card
      as="section"
      padding="none"
      className={cx(styles.card, className)}
      aria-labelledby="conversations-title"
    >
      <div className={styles.header}>
        <h2 id="conversations-title" className={styles.title}>
          المحادثات
        </h2>
        <IconButton
          label={NEW_CONVERSATION}
          icon={SquarePen}
          variant="muted"
          aria-haspopup="dialog"
          onClick={onNewConversation}
        />
      </div>

      {isLoading ? (
        <div className={styles.empty}>
          <LoadingState label="جارٍ تحميل المحادثات…" />
        </div>
      ) : error ? (
        <div className={styles.empty}>
          <ErrorState
            isBoxed={false}
            title="تعذّر تحميل المحادثات"
            description={error.message}
            action={
              <Button variant="soft" onClick={onRetry}>
                إعادة المحاولة
              </Button>
            }
          />
        </div>
      ) : conversations.length === 0 ? (
        <div className={styles.empty}>
          <EmptyState
            isBoxed={false}
            icon={<MessageCircle />}
            title="لا توجد محادثات"
            action={
              <Button variant="soft" onClick={onNewConversation}>
                ابدأ محادثة جديدة
              </Button>
            }
          />
        </div>
      ) : (
        <ul className={styles.list}>
          {conversations.map((conversation) => {
            const last = conversation.lastMessage;
            const isActive = conversation.id === activeId;
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  id={getConversationButtonId(conversation.id)}
                  className={cx(styles.item, isActive && styles.active)}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={() => {
                    onSelect(conversation.id);
                  }}
                >
                  <Avatar name={conversation.contactName} shape="circle" />
                  <span className={styles.body}>
                    <span className={styles.row}>
                      <span className={styles.name}>{conversation.contactName}</span>
                      {last ? (
                        <time className={styles.time} dateTime={last.sentAt}>
                          {formatMessageDay(last.sentAt)}
                        </time>
                      ) : null}
                    </span>
                    <span className={styles.row}>
                      <span className={styles.excerpt}>{last?.text ?? 'ابدأ المحادثة'}</span>
                      {conversation.unreadCount > 0 ? (
                        <span className={styles.unread}>
                          <span aria-hidden="true">{conversation.unreadCount}</span>
                          <span className="visually-hidden">
                            {`${String(conversation.unreadCount)} رسائل غير مقروءة`}
                          </span>
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
