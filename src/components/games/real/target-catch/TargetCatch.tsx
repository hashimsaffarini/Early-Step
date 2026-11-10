import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { ProgressBar } from '@/components/ui/Feedback';
import { cx } from '@/utils/classNames';

import type { CatchLevel, EngineProps, Visual } from '../types';

import styles from './TargetCatch.module.css';

interface Balloon {
  key: number;
  lane: number;
  visual: Visual;
  isTarget: boolean;
  /** Start part-way through the float cycle so balloons do not move in step (0–1). */
  phase: number;
}

const pick = <T,>(list: readonly T[], random: () => number): T | undefined =>
  list[Math.floor(random() * list.length)];

/**
 * «اصطد الهدف» — balloons float gently in the play area; the child taps the ones that fit the
 * goal (e.g. «حرف أ»). A caught target pops and a new balloon floats in; a wrong one just wiggles.
 * The session ends after `goal` targets. No timer; with reduced motion the balloons stay still.
 */
export function TargetCatch({ level, onComplete, random = Math.random }: EngineProps<CatchLevel>) {
  // Keys for balloons added later (the first ones use their lane as key).
  const nextKey = useRef(level.balloons);
  const makeBalloon = (lane: number, forceTarget: boolean, key: number): Balloon => {
    const isTarget = forceTarget || random() < 0.5;
    const visual = pick(isTarget ? level.targets : level.distractors, random) ?? level.targets[0];
    return {
      key,
      lane,
      visual: visual ?? { emoji: '🎈', label: 'بالون' },
      isTarget: isTarget || level.distractors.length === 0,
      phase: random(),
    };
  };
  const [balloons, setBalloons] = useState<Balloon[]>(() =>
    Array.from({ length: level.balloons }, (_, lane) => makeBalloon(lane, lane === 0, lane)),
  );
  const [caught, setCaught] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [wiggling, setWiggling] = useState<number | null>(null);
  const [message, setMessage] = useState('المس البالون الصحيح لتجمعه.');
  const finished = useRef(false);

  useEffect(() => {
    if (finished.current || caught < level.goal) return;
    finished.current = true;
    onComplete([
      { label: 'الأهداف التي جمعتها', value: `${caught.toString()} من ${level.goal.toString()}` },
      { label: 'محاولات خارج الهدف', value: mistakes.toString() },
    ]);
  }, [caught, mistakes, level.goal, onComplete]);

  const tap = (balloon: Balloon) => {
    if (caught >= level.goal) return;
    if (!balloon.isTarget) {
      setMistakes((value) => value + 1);
      setWiggling(balloon.key);
      setMessage(`هذا ${balloon.visual.label}، ابحث عن الهدف.`);
      return;
    }
    setCaught((value) => value + 1);
    setMessage(`رائع! اصطدت ${balloon.visual.label}.`);
    const newKey = () => {
      nextKey.current += 1;
      return nextKey.current;
    };
    const replaced = balloons.map((item) =>
      item.key === balloon.key ? makeBalloon(item.lane, false, newKey()) : item,
    );
    // Keep at least one target in the air so the child is never stuck.
    const [first, ...rest] = replaced;
    setBalloons(
      replaced.some((item) => item.isTarget) || !first
        ? replaced
        : [makeBalloon(first.lane, true, newKey()), ...rest],
    );
  };

  return (
    <div className={styles.game}>
      <p className={styles.prompt}>{level.prompt}</p>
      <ProgressBar
        label="الأهداف التي جمعتها"
        value={caught}
        max={level.goal}
        tone="success"
        showLabel
        valueText={`${caught.toString()} من ${level.goal.toString()}`}
      />
      <p className={styles.status} role="status">
        {message}
      </p>
      <ul
        className={styles.field}
        aria-label="منطقة اللعب"
        style={{ '--lanes': level.balloons.toString() } as CSSProperties}
      >
        {balloons.map((balloon) => (
          <li
            key={balloon.key}
            className={styles.lane}
            style={
              {
                '--lane': balloon.lane.toString(),
                '--float': `${level.floatSeconds.toString()}s`,
                '--phase': `-${(balloon.phase * level.floatSeconds).toFixed(2)}s`,
              } as CSSProperties
            }
          >
            <button
              type="button"
              className={cx(styles.balloon, wiggling === balloon.key && styles.wiggle)}
              aria-label={`بالون: ${balloon.visual.label}`}
              onAnimationEnd={(event) => {
                if (event.animationName.includes('wiggle')) setWiggling(null);
              }}
              onClick={() => {
                tap(balloon);
              }}
            >
              <span className={styles.face} aria-hidden="true">
                {balloon.visual.emoji}
              </span>
              <span className={styles.string} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
