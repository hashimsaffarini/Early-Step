import { Check, X } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './AnswerTile.module.css';

export type AnswerTileState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

const STATE_TEXT: Partial<Record<AnswerTileState, string>> = {
  selected: 'مختارة',
  correct: 'إجابة صحيحة',
  wrong: 'إجابة غير صحيحة',
};

export interface AnswerTileProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  label: string;
  /** Decorative picture above the label. */
  emoji?: string | undefined;
  /** Option picture from the server (already resolved with `resolveMediaUrl`). */
  imageUrl?: string | null | undefined;
  /** Arabic letter badge (أ ب ج د) — test player style. */
  badge?: string | undefined;
  state?: AnswerTileState;
  layout?: 'stack' | 'row';
}

/**
 * Answer choice for tests, games and the assessment. Correct/wrong feedback uses an icon,
 * a border style and hidden text in addition to colour.
 */
export function AnswerTile({
  label,
  emoji,
  imageUrl,
  badge,
  state = 'idle',
  layout = 'stack',
  className,
  ...rest
}: AnswerTileProps) {
  const stateText = STATE_TEXT[state];
  return (
    <button
      type="button"
      className={cx(
        styles.tile,
        layout === 'row' && styles.row,
        state !== 'idle' && styles[state],
        className,
      )}
      aria-pressed={state === 'selected' ? true : undefined}
      {...rest}
    >
      {badge ? (
        <span className={styles.badge} aria-hidden="true">
          {badge}
        </span>
      ) : null}
      {emoji ? (
        <span className={styles.emoji} aria-hidden="true">
          {emoji}
        </span>
      ) : null}
      {imageUrl ? (
        <img className={styles.image} src={imageUrl} alt={label ? '' : 'صورة الإجابة'} />
      ) : null}
      {label ? <span className={styles.label}>{label}</span> : null}
      {state === 'correct' || state === 'wrong' ? (
        <span className={styles.stateIcon} aria-hidden="true">
          {state === 'correct' ? <Check /> : <X />}
        </span>
      ) : null}
      {stateText ? <span className="visually-hidden">{`(${stateText})`}</span> : null}
    </button>
  );
}
