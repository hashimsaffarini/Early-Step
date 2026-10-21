import { RotateCcw, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import { GameOptionCard } from '../shared/GameOptionCard';
import { optionName } from '../shared/optionName';
import styles from '../shared/Game.module.css';
import type { ChallengeProps } from '../types';

/**
 * تحدي الذاكرة — one real Sequence question. Tap-to-order (no drag needed): each tap puts the card
 * in the next place; «تراجع» removes the last one, «إعادة» clears the order. The order is sent as
 * `orderedOptionIds`; the server decides whether it is right.
 */
export function MemorySequence({
  question,
  selection,
  onSelectionChange,
  disabled,
}: ChallengeProps) {
  const byId = new Map(question.options.map((option, index) => [option.id, { option, index }]));
  return (
    <div className={styles.sequence}>
      <ul className={styles.optionGrid} aria-label="البطاقات">
        {question.options.map((option, index) => {
          const place = selection.indexOf(option.id);
          return (
            <li key={option.id}>
              <GameOptionCard
                option={option}
                index={index}
                isSelected={place >= 0}
                orderBadge={place >= 0 ? place + 1 : undefined}
                disabled={disabled === true || place >= 0}
                onPress={() => {
                  onSelectionChange([...selection, option.id]);
                }}
              />
            </li>
          );
        })}
      </ul>
      <section className={styles.orderPanel} aria-labelledby={`order-${question.id}`}>
        <h3 id={`order-${question.id}`} className={styles.orderTitle}>
          ترتيبك
        </h3>
        <ol className={styles.slots}>
          {question.options.map((option, place) => {
            const picked = selection[place];
            const entry = picked === undefined ? undefined : byId.get(picked);
            return (
              <li key={option.id} className={entry ? styles.slotFilled : styles.slot}>
                <span className={styles.slotNumber} aria-hidden="true">
                  {place + 1}
                </span>
                {entry ? (
                  <span className={styles.slotText}>
                    <bdi>{optionName(entry.option, entry.index)}</bdi>
                  </span>
                ) : (
                  <span className={styles.slotEmpty}>فارغ</span>
                )}
              </li>
            );
          })}
        </ol>
        <div className={styles.controls}>
          <Button
            variant="outline"
            iconStart={<Undo2 aria-hidden="true" />}
            disabled={disabled === true || selection.length === 0}
            onClick={() => {
              onSelectionChange(selection.slice(0, -1));
            }}
          >
            تراجع
          </Button>
          <Button
            variant="ghost"
            iconStart={<RotateCcw aria-hidden="true" />}
            disabled={disabled === true || selection.length === 0}
            onClick={() => {
              onSelectionChange([]);
            }}
          >
            إعادة الترتيب
          </Button>
        </div>
      </section>
    </div>
  );
}
