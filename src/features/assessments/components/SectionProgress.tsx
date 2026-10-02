import { cx } from '@/utils/classNames';

import styles from './SectionProgress.module.css';

export interface SectionProgressProps {
  completed: number;
  total: number;
}

/** Top-bar progress: one dot per section + "1/4" pill, announced as a sentence. */
export function SectionProgress({ completed, total }: SectionProgressProps) {
  return (
    <div className={styles.progress}>
      <span className={styles.dots} aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span key={index} className={cx(styles.dot, index < completed && styles.done)} />
        ))}
      </span>
      <bdi dir="ltr" className={styles.count} aria-hidden="true">
        {`${completed.toString()}/${total.toString()}`}
      </bdi>
      <span className="visually-hidden">{`الأقسام المكتملة: ${completed.toString()} من ${total.toString()}`}</span>
    </div>
  );
}
