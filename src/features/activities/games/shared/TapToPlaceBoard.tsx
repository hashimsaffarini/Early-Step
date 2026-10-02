import { cx } from '@/utils/classNames';

import type { PlaceState } from './tapToPlace';
import styles from './TapToPlaceBoard.module.css';

export interface TapToPlaceBoardProps {
  state: PlaceState;
  onPlace: (id: string) => void;
  onRemove: (id: string) => void;
  /** Word chips or single letters (letters are larger, and the line shows empty slots). */
  kind: 'word' | 'letter';
  lineLabel: string;
  trayLabel: string;
  /** After checking: colours + words on the answer line. */
  result?: 'correct' | 'wrong' | null;
  isLocked?: boolean;
}

/**
 * Tap a chip to add it to the answer line, tap it again to send it back — a tap-only
 * alternative to Replit's drag interactions, with ≥ 56px chips for small hands.
 */
export function TapToPlaceBoard({
  state,
  onPlace,
  onRemove,
  kind,
  lineLabel,
  trayLabel,
  result = null,
  isLocked = false,
}: TapToPlaceBoardProps) {
  const emptySlots = kind === 'letter' ? state.tray.length : 0;
  const isEmpty = state.placed.length === 0 && emptySlots === 0;

  return (
    <div className={styles.board}>
      <ul
        className={cx(
          styles.line,
          result === 'correct' && styles.lineCorrect,
          result === 'wrong' && styles.lineWrong,
        )}
        aria-label={lineLabel}
      >
        {state.placed.map((token) => (
          <li key={token.id}>
            <button
              type="button"
              className={cx(styles.token, styles.placedToken, kind === 'letter' && styles.letter)}
              aria-label={`${token.text} (اضغط لإعادتها)`}
              disabled={isLocked}
              onClick={() => {
                onRemove(token.id);
              }}
            >
              {token.text}
            </button>
          </li>
        ))}
        {Array.from({ length: emptySlots }, (_, index) => (
          <li key={`slot-${index.toString()}`} className={styles.slot} aria-hidden="true">
            ـ
          </li>
        ))}
        {isEmpty ? <li className={styles.placeholder}>اضغط على الكلمات بالترتيب</li> : null}
      </ul>
      <ul className={styles.tray} aria-label={trayLabel}>
        {state.tray.map((token) => (
          <li key={token.id}>
            <button
              type="button"
              className={cx(styles.token, kind === 'letter' && styles.letter)}
              disabled={isLocked}
              onClick={() => {
                onPlace(token.id);
              }}
            >
              {token.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
