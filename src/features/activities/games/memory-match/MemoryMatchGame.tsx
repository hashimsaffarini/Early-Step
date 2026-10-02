import { CircleCheck, Footprints, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FeedbackMessage, StatPill } from '@/components/players';
import { Button } from '@/components/ui/Button';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { MEMORY_PAIRS } from './content';
import { createDeck, isPair, type MemoryCard } from './memoryLogic';
import styles from './MemoryMatchGame.module.css';

const MISMATCH_DELAY_MS = 900;

/** Flip two cards at a time and find every pair (Replit «مطابقة البطاقات»). */
export function MemoryMatchGame({ onFinish, sound }: GameProps) {
  const [deck, setDeck] = useState<MemoryCard[]>(() => createDeck(MEMORY_PAIRS));
  const [open, setOpen] = useState<MemoryCard[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null);

  const isChecking = open.length === 2;

  useEffect(() => {
    const [first, second] = open;
    if (!first || !second || isPair(first, second)) return;
    const timer = window.setTimeout(() => {
      setOpen([]);
    }, MISMATCH_DELAY_MS);
    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  const flip = (card: MemoryCard) => {
    if (isChecking || matched.has(card.pairKey) || open.some((item) => item.id === card.id)) return;
    sound.play('tap');
    const [first] = open;
    if (!first) {
      setOpen([card]);
      setLastResult(null);
      return;
    }
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (isPair(first, card)) {
      const nextMatched = new Set(matched).add(card.pairKey);
      setMatched(nextMatched);
      setOpen([]);
      setLastResult('correct');
      sound.play('correct');
      if (nextMatched.size === MEMORY_PAIRS.length) {
        onFinish({
          correct: MEMORY_PAIRS.length,
          total: nextMoves,
          summary: `طابقت ${MEMORY_PAIRS.length.toString()} أزواج في ${nextMoves.toString()} محاولات`,
        });
      }
    } else {
      setOpen([first, card]);
      setLastResult('wrong');
      sound.play('wrong');
    }
  };

  const restart = () => {
    setDeck(createDeck(MEMORY_PAIRS));
    setOpen([]);
    setMatched(new Set());
    setMoves(0);
    setLastResult(null);
  };

  return (
    <div className={sharedStyles.game}>
      <div className={sharedStyles.actions}>
        <StatPill icon={Footprints}>{`المحاولات: ${moves.toString()}`}</StatPill>
        <StatPill icon={CircleCheck} tone="success">
          {`الأزواج: ${matched.size.toString()} من ${MEMORY_PAIRS.length.toString()}`}
        </StatPill>
      </div>
      <ul className={styles.board} aria-label="البطاقات">
        {deck.map((card, index) => {
          const isMatched = matched.has(card.pairKey);
          const isFaceUp = isMatched || open.some((item) => item.id === card.id);
          const position = (index + 1).toString();
          return (
            <li key={card.id}>
              <button
                type="button"
                className={cx(styles.card, isFaceUp && styles.faceUp, isMatched && styles.matched)}
                aria-label={
                  isFaceUp
                    ? `بطاقة ${position}: ${card.word}${isMatched ? ' (تمت المطابقة)' : ''}`
                    : `بطاقة ${position} مقلوبة`
                }
                disabled={isMatched}
                onClick={() => {
                  flip(card);
                }}
              >
                <span className={styles.inner} aria-hidden="true">
                  <span className={cx(styles.face, styles.back)}>?</span>
                  <span className={cx(styles.face, styles.front)}>
                    <span className={styles.emoji}>{card.emoji}</span>
                    <span className={styles.word}>{card.word}</span>
                    {isMatched ? <span className={styles.matchedMark}>✓</span> : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <FeedbackMessage
        kind={lastResult}
        text={lastResult === 'correct' ? 'أحسنت! وجدت زوجاً' : 'ليستا متشابهتين، تذكّر مكانهما'}
      />
      <div className={sharedStyles.actions}>
        <Button
          variant="ghost"
          size="sm"
          iconStart={<RotateCcw aria-hidden="true" />}
          onClick={restart}
        >
          ابدأ من جديد
        </Button>
      </div>
    </div>
  );
}
