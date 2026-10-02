import type { CSSProperties } from 'react';

import styles from './Confetti.module.css';

const PIECES = 28;
const MAX_DELAY_MS = 600;

/** One-shot CSS confetti burst (decorative, reduced-motion aware). Mount it to play. */
export function Confetti() {
  return (
    <div className={styles.confetti} aria-hidden="true">
      {Array.from({ length: PIECES }, (_, index) => {
        const style = {
          insetInlineStart: `${((index * 37) % 100).toString()}%`,
          animationDelay: `${((index * 71) % MAX_DELAY_MS).toString()}ms`,
        } satisfies CSSProperties;
        return <span key={index} className={styles.piece} style={style} />;
      })}
    </div>
  );
}
