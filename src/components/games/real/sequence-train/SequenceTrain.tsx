import { ArrowLeft, RotateCcw, Undo2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';

import { shuffle } from '../shuffle';
import type { EngineProps, SequenceLevel, Visual } from '../types';

import styles from './SequenceTrain.module.css';

interface Card {
  key: string;
  /** Correct position in the train. */
  position: number;
  visual: Visual;
}

/**
 * «قطار الترتيب» — load the train's wagons in order. Tap a card to put it in the next empty wagon,
 * tap a wagon to take its card back (rearrange), «تراجع» removes the last card, «إعادة» empties the
 * train. A full train is checked gently; a wrong order just asks to swap wagons. Several stages.
 */
export function SequenceTrain({ level, onComplete, random }: EngineProps<SequenceLevel>) {
  const [stageIndex, setStageIndex] = useState(0);
  const stage = level.stages[stageIndex];
  const cards = useMemo<Card[]>(
    () =>
      shuffle(
        (stage?.items ?? []).map((visual, position) => ({
          key: `${stageIndex.toString()}-${position.toString()}`,
          position,
          visual,
        })),
        random,
      ),
    [stage, stageIndex, random],
  );
  const [wagons, setWagons] = useState<(string | null)[]>(() =>
    (stage?.items ?? []).map(() => null),
  );
  const [history, setHistory] = useState<readonly string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [isStageDone, setIsStageDone] = useState(false);
  const [message, setMessage] = useState('اضغط البطاقات بالترتيب لتحميلها في القطار.');
  const finished = useRef(false);

  const loaded = wagons.filter((key) => key !== null).length;

  /** A full train is checked right away: done, or a gentle request to swap wagons. */
  const check = (next: readonly (string | null)[]) => {
    if (next.some((key) => key === null)) return;
    const correct = next.every(
      (key, index) => cards.find((card) => card.key === key)?.position === index,
    );
    if (correct) {
      setIsStageDone(true);
      setMessage('أحسنت! القطار مرتّب بشكل صحيح.');
      return;
    }
    setMistakes((value) => value + 1);
    setMessage('الترتيب غير صحيح بعد، اضغط عربة لإخراج بطاقتها وجرّب من جديد.');
  };

  const place = (card: Card) => {
    const empty = wagons.indexOf(null);
    if (empty < 0 || wagons.includes(card.key)) return;
    const next = wagons.map((key, index) => (index === empty ? card.key : key));
    setWagons(next);
    setHistory([...history, card.key]);
    check(next);
  };

  const removeCard = (key: string) => {
    if (isStageDone) return;
    setWagons(wagons.map((value) => (value === key ? null : value)));
    setHistory(history.filter((value) => value !== key));
  };

  const nextStage = () => {
    const next = stageIndex + 1;
    if (next >= level.stages.length) {
      if (finished.current) return;
      finished.current = true;
      onComplete([
        {
          label: 'المراحل المكتملة',
          value: `${level.stages.length.toString()} من ${level.stages.length.toString()}`,
        },
        { label: 'محاولات الترتيب الخاطئة', value: mistakes.toString() },
      ]);
      return;
    }
    setStageIndex(next);
    setWagons((level.stages[next]?.items ?? []).map(() => null));
    setHistory([]);
    setIsStageDone(false);
    setMessage('مرحلة جديدة! حمّل القطار بالترتيب.');
  };

  if (!stage) return null;
  const byKey = new Map(cards.map((card) => [card.key, card]));

  return (
    <div className={styles.game}>
      <p className={styles.stage}>
        {`المرحلة ${(stageIndex + 1).toString()} من ${level.stages.length.toString()}`}
      </p>
      <p className={styles.prompt}>{stage.prompt}</p>
      <p className={styles.status} role="status">
        {message}
      </p>
      <ol className={styles.train} aria-label="عربات القطار">
        <li className={styles.engine} aria-hidden="true">
          🚂
        </li>
        {wagons.map((key, index) => {
          const card = key ? byKey.get(key) : undefined;
          return (
            <li key={`wagon-${index.toString()}`}>
              <button
                type="button"
                className={cx(styles.wagon, card && styles.full, isStageDone && styles.done)}
                disabled={!card || isStageDone}
                aria-label={
                  card
                    ? `العربة ${(index + 1).toString()}: ${card.visual.label} — اضغط لإخراجها`
                    : `العربة ${(index + 1).toString()} فارغة`
                }
                onClick={() => {
                  if (key) removeCard(key);
                }}
              >
                <span className={styles.wagonNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <span className={styles.cargo} aria-hidden="true">
                  {card?.visual.emoji ?? ''}
                </span>
                <span className={styles.wheels} aria-hidden="true">
                  ● ●
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {isStageDone ? (
        <div className={styles.controls}>
          <Button size="lg" iconEnd={<ArrowLeft aria-hidden="true" />} onClick={nextStage}>
            {stageIndex + 1 < level.stages.length ? 'المرحلة التالية' : 'إنهاء اللعبة'}
          </Button>
        </div>
      ) : (
        <>
          <ul className={styles.cards} aria-label="البطاقات">
            {cards.map((card) => {
              const isLoaded = wagons.includes(card.key);
              return (
                <li key={card.key}>
                  <button
                    type="button"
                    className={cx(styles.card, isLoaded && styles.loaded)}
                    disabled={isLoaded}
                    aria-label={isLoaded ? `${card.visual.label} — في القطار` : card.visual.label}
                    onClick={() => {
                      place(card);
                    }}
                  >
                    <span className={styles.cardEmoji} aria-hidden="true">
                      {card.visual.emoji}
                    </span>
                    <span className={styles.cardLabel} aria-hidden="true">
                      {card.visual.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className={styles.controls}>
            <Button
              variant="outline"
              iconStart={<Undo2 aria-hidden="true" />}
              disabled={history.length === 0}
              onClick={() => {
                const last = history.at(-1);
                if (last) removeCard(last);
              }}
            >
              تراجع
            </Button>
            <Button
              variant="ghost"
              iconStart={<RotateCcw aria-hidden="true" />}
              disabled={loaded === 0}
              onClick={() => {
                setWagons(wagons.map(() => null));
                setHistory([]);
              }}
            >
              إعادة
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
