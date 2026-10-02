import type { ReactNode } from 'react';

import { ProgressBar } from '@/components/ui/Feedback';

import styles from './QuestionProgress.module.css';

export interface QuestionProgressProps {
  /** 1-based position of the current item. */
  current: number;
  total: number;
  /** Noun for the counter: "السؤال", "الجملة", "المستوى"… */
  noun?: string;
  /** Pills at the inline-end (score, moves, timer). */
  extra?: ReactNode;
  tone?: 'primary' | 'success' | 'accent';
}

/** "السؤال 2 من 8" counter + progress bar used by every player. */
export function QuestionProgress({
  current,
  total,
  noun = 'السؤال',
  extra,
  tone = 'success',
}: QuestionProgressProps) {
  const text = `${noun} ${current} من ${total}`;
  return (
    <div className={styles.progress}>
      <div className={styles.row}>
        <p className={styles.counter}>{text}</p>
        {extra ? <div className={styles.extra}>{extra}</div> : null}
      </div>
      <ProgressBar value={current} max={total} label="التقدّم" valueText={text} tone={tone} />
    </div>
  );
}
