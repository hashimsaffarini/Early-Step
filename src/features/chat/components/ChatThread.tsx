import { ArrowRight, SendHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { ROLE_LABELS } from '@/constants/roleLabels';
import type { AppError } from '@/services/http/apiError';
import type { UserRole } from '@/types/roles';
import { cx } from '@/utils/classNames';

import type { ChatMessage } from '../types';
import { THREAD_TITLE_ID } from '../utils/chatIds';
import { formatMessageDay, formatMessageTime, toDayKey } from '../utils/chatTime';

import styles from './ChatThread.module.css';

export interface ChatThreadProps {
  contactName: string;
  contactRole: UserRole | null;
  messages: readonly ChatMessage[];
  isOwn: (message: ChatMessage) => boolean;
  isLoading: boolean;
  loadError: Error | null;
  onRetry: () => void;
  hasOlder: boolean;
  isLoadingOlder: boolean;
  /** Loading older messages failed (the button retries). */
  olderFailed?: boolean;
  onLoadOlder: () => void;
  /** Sends the text; resolves true when the server accepted it (the draft is then cleared). */
  onSend: (text: string) => Promise<boolean>;
  sendError: AppError | null;
  /** Returns to the conversation list (small screens only; hidden on desktop). */
  onBack: () => void;
  className?: string | undefined;
}

/** Thread header, message bubbles with day separators, older-messages button, composer. */
export function ChatThread({
  contactName,
  contactRole,
  messages,
  isOwn,
  isLoading,
  loadError,
  onRetry,
  hasOlder,
  isLoadingOlder,
  olderFailed = false,
  onLoadOlder,
  onSend,
  sendError,
  onBack,
  className,
}: ChatThreadProps) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLOListElement>(null);
  const inputId = useId();
  const lastId = messages.at(-1)?.id;

  // Stick to the newest message when one arrives (not when older ones are prepended).
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [lastId]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    void onSend(text).then((accepted) => {
      if (!accepted) setDraft(text);
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <li className={styles.emptyThread}>
          <LoadingState label="جارٍ تحميل الرسائل…" />
        </li>
      );
    }
    if (loadError) {
      return (
        <li className={styles.emptyThread}>
          <ErrorState
            isBoxed={false}
            title="تعذّر تحميل الرسائل"
            description={loadError.message}
            action={
              <Button variant="soft" onClick={onRetry}>
                إعادة المحاولة
              </Button>
            }
          />
        </li>
      );
    }
    if (messages.length === 0) return <li className={styles.emptyThread}>ابدأ المحادثة</li>;
    return messages.flatMap((message, index) => {
      const own = isOwn(message);
      const day = toDayKey(message.sentAt);
      const previous = messages[index - 1];
      const startsDay = !previous || toDayKey(previous.sentAt) !== day;
      const bubble = (
        <li key={message.id} className={cx(styles.message, own ? styles.own : styles.received)}>
          <span className="visually-hidden">{own ? 'أنت:' : `${contactName}:`}</span>
          <p className={styles.bubble}>{message.text}</p>
          {message.pending ? (
            <span className={styles.time}>جارٍ الإرسال…</span>
          ) : (
            <time className={styles.time} dateTime={message.sentAt}>
              {formatMessageTime(message.sentAt)}
            </time>
          )}
        </li>
      );
      return startsDay
        ? [
            <li key={`day-${day}`} className={styles.day}>
              {formatMessageDay(message.sentAt)}
            </li>,
            bubble,
          ]
        : [bubble];
    });
  };

  return (
    <Card
      as="section"
      padding="none"
      className={cx(styles.card, className)}
      aria-labelledby={THREAD_TITLE_ID}
    >
      <header className={styles.header}>
        <IconButton
          label="العودة إلى المحادثات"
          icon={ArrowRight}
          variant="muted"
          className={styles.back}
          onClick={onBack}
        />
        <Avatar name={contactName} shape="circle" />
        <div>
          <h2 id={THREAD_TITLE_ID} className={styles.title} tabIndex={-1}>
            {contactName}
          </h2>
          {contactRole ? <p className={styles.role}>{ROLE_LABELS[contactRole]}</p> : null}
        </div>
      </header>

      <ol ref={listRef} className={styles.messages} aria-label="الرسائل">
        {hasOlder && !isLoading && !loadError ? (
          <li className={styles.day}>
            <Button variant="ghost" size="sm" isLoading={isLoadingOlder} onClick={onLoadOlder}>
              {olderFailed ? 'إعادة محاولة تحميل الرسائل الأقدم' : 'تحميل رسائل أقدم'}
            </Button>
            {olderFailed ? (
              <p role="alert" className={styles.olderError}>
                تعذّر تحميل الرسائل الأقدم.
              </p>
            ) : null}
          </li>
        ) : null}
        {renderBody()}
      </ol>

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {sendError ? (
          <div className={styles.sendError}>
            <ApiErrorAlert error={sendError} message="تعذّر إرسال الرسالة. حاول مرة أخرى." />
          </div>
        ) : null}
        <label htmlFor={inputId} className="visually-hidden">
          اكتب رسالتك
        </label>
        <Textarea
          id={inputId}
          className={styles.input}
          rows={1}
          placeholder="اكتب رسالتك..."
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          onKeyDown={onKeyDown}
        />
        <IconButton
          type="submit"
          label="إرسال"
          icon={SendHorizontal}
          variant="primary"
          className={styles.send}
          disabled={!draft.trim()}
        />
      </form>
    </Card>
  );
}
