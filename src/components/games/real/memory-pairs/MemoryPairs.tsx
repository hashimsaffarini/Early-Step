import { CircleCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { cx } from '@/utils/classNames';

import { shuffle } from '../shuffle';
import type { EngineProps, MemoryPairsLevel, Visual } from '../types';

import styles from './MemoryPairs.module.css';

/** A wrong pair stays visible this long before turning back (calm, no flashing). */
export const MISMATCH_DELAY_MS = 1100;

interface Card {
  key: string;
  pairId: string;
  visual: Visual;
}

/**
 * «لعبة الذاكرة» — real memory cards. Cards lie face down; the child turns two. A match stays
 * open with a gentle success mark; a non-match is shown briefly and turns back. The game ends when
 * every pair is found. Native buttons: keyboard and screen readers can play too.
 */
export function MemoryPairs({ level, onComplete, random }: EngineProps<MemoryPairsLevel>) {
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        level.pairs.flatMap((pair) => [
          { key: `${pair.id}-a`, pairId: pair.id, visual: pair.a },
          { key: `${pair.id}-b`, pairId: pair.id, visual: pair.b },
        ]),
        random,
      ),
    [level, random],
  );
  const [open, setOpen] = useState<readonly string[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [message, setMessage] = useState('اقلب بطاقتين للبحث عن زوج متطابق.');
  const timer = useRef<number | null>(null);
  const finished = useRef(false);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (finished.current || matched.size !== level.pairs.length) return;
    finished.current = true;
    onComplete([
      {
        label: 'الأزواج المكتشفة',
        value: `${matched.size.toString()} من ${level.pairs.length.toString()}`,
      },
      { label: 'عدد المحاولات', value: moves.toString() },
    ]);
  }, [matched, moves, level.pairs.length, onComplete]);

  const isLocked = open.length === 2;

  const turn = (card: Card) => {
    if (isLocked || open.includes(card.key) || matched.has(card.pairId)) return;
    const next = [...open, card.key];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((value) => value + 1);
    const [first, second] = next.map((key) => cards.find((item) => item.key === key));
    if (first !== undefined && first.pairId === second?.pairId) {
      setMatched((current) => new Set([...current, first.pairId]));
      setOpen([]);
      setMessage(`أحسنت! وجدت زوجاً: ${first.visual.label} و${second.visual.label}.`);
      return;
    }
    setMessage('ليستا متطابقتين، حاول مرة أخرى.');
    timer.current = window.setTimeout(() => {
      setOpen([]);
      timer.current = null;
    }, MISMATCH_DELAY_MS);
  };

  return (
    <div className={styles.game}>
      <p className={styles.status} role="status">
        {message}
      </p>
      <ul
        className={styles.grid}
        data-count={cards.length}
        aria-label={`بطاقات الذاكرة، وجدت ${matched.size.toString()} من ${level.pairs.length.toString()} أزواج`}
      >
        {cards.map((card, index) => {
          const isMatched = matched.has(card.pairId);
          const isFaceUp = isMatched || open.includes(card.key);
          let name = `بطاقة ${(index + 1).toString()} مقلوبة`;
          if (isMatched) name = `${card.visual.label} — زوج مكتشف`;
          else if (isFaceUp) name = card.visual.label;
          return (
            <li key={card.key}>
              <button
                type="button"
                className={cx(styles.card, isFaceUp && styles.faceUp, isMatched && styles.matched)}
                aria-label={name}
                aria-pressed={isFaceUp}
                disabled={isMatched}
                onClick={() => {
                  turn(card);
                }}
              >
                <span className={styles.inner} aria-hidden="true">
                  <span className={styles.back}>⭐</span>
                  <span className={styles.front}>
                    <span className={styles.emoji}>{card.visual.emoji}</span>
                    <span className={styles.caption}>{card.visual.label}</span>
                  </span>
                </span>
                {isMatched ? <CircleCheck className={styles.check} aria-hidden="true" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
