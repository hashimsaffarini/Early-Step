import { CircleCheck, Info, RotateCcw } from 'lucide-react';

import { cx } from '@/utils/classNames';

import styles from './FeedbackMessage.module.css';

export type FeedbackKind = 'correct' | 'wrong' | 'info';

const DEFAULT_TEXT: Record<FeedbackKind, string> = {
  correct: 'أحسنت! إجابة صحيحة',
  wrong: 'لا بأس، حاول مرة أخرى',
  info: '',
};

const ICONS = { correct: CircleCheck, wrong: RotateCcw, info: Info } as const;

export interface FeedbackMessageProps {
  kind: FeedbackKind | null;
  text?: string | undefined;
}

/**
 * Spoken-style feedback line under a question (icon + words, never colour alone).
 * Always rendered (reserving space) and announced politely when it changes.
 */
export function FeedbackMessage({ kind, text }: FeedbackMessageProps) {
  const Icon = kind ? ICONS[kind] : null;
  const message = kind ? (text ?? DEFAULT_TEXT[kind]) : '';
  return (
    <p
      className={cx(styles.message, kind ? styles[kind] : styles.placeholder)}
      role="status"
      aria-live="polite"
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      {message}
    </p>
  );
}
