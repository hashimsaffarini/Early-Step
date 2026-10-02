import { ArrowRight, SendHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { cx } from '@/utils/classNames';

import type { Conversation } from '../types';
import { THREAD_TITLE_ID } from '../utils/chatIds';
import { formatMessageDay, formatMessageTime, toDayKey } from '../utils/chatTime';

import styles from './ChatThread.module.css';

export interface ChatThreadProps {
  conversation: Conversation;
  onSend: (text: string) => void;
  /** Returns to the conversation list (small screens only; hidden on desktop). */
  onBack: () => void;
  className?: string | undefined;
}

/** Thread header, message bubbles with day separators, and the composer. */
export function ChatThread({ conversation, onSend, onBack, className }: ChatThreadProps) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLOListElement>(null);
  const inputId = useId();
  const { contact, messages } = conversation;

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages.length, conversation.id]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
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
        <Avatar name={contact.name} shape="circle" />
        <div>
          <h2 id={THREAD_TITLE_ID} className={styles.title} tabIndex={-1}>
            {contact.name}
          </h2>
          <p className={styles.role}>{ROLE_LABELS[contact.role]}</p>
        </div>
      </header>

      <ol ref={listRef} className={styles.messages} aria-label="الرسائل">
        {messages.length === 0 ? <li className={styles.emptyThread}>ابدأ المحادثة</li> : null}
        {messages.flatMap((message, index) => {
          const day = toDayKey(message.sentAt);
          const previous = messages[index - 1];
          const startsDay = !previous || toDayKey(previous.sentAt) !== day;
          const bubble = (
            <li
              key={message.id}
              className={cx(styles.message, message.isOwn ? styles.own : styles.received)}
            >
              <span className="visually-hidden">{message.isOwn ? 'أنت:' : `${contact.name}:`}</span>
              <p className={styles.bubble}>{message.text}</p>
              <time className={styles.time} dateTime={message.sentAt}>
                {formatMessageTime(message.sentAt)}
              </time>
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
        })}
      </ol>

      <form
        className={styles.composer}
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
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
