import { ArrowRight, Play, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { cx } from '@/utils/classNames';

import { RealGameBoard } from './RealGameBoard';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
  type RealGameDefinition,
  type SessionFigure,
} from './types';

import styles from './RealGameSession.module.css';

export interface RealGameSessionProps {
  game: RealGameDefinition;
  initialDifficulty: Difficulty;
  /** «العودة للخطة». */
  exitTo: string;
  exitLabel?: string;
  random?: () => number;
}

type Phase =
  | { kind: 'start' }
  | { kind: 'play'; run: number }
  | { kind: 'end'; summary: readonly SessionFigure[] };

/**
 * A real game session: a short start screen (picture, name, one-line instruction, difficulty and
 * «ابدأ اللعب»), the game itself, then a completion screen with the session's own figures and
 * «العب مرة أخرى». Games are always replayable. The figures are session values only: they are not
 * sent to the server (no backend contract stores a real-game result — BACKEND_REQUESTS).
 */
export function RealGameSession({
  game,
  initialDifficulty,
  exitTo,
  exitLabel = 'العودة للخطة',
  random,
}: RealGameSessionProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [phase, setPhase] = useState<Phase>({ kind: 'start' });
  const run = useRef(0);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase.kind]);

  const play = () => {
    run.current += 1;
    setPhase({ kind: 'play', run: run.current });
  };
  const complete = useCallback((summary: readonly SessionFigure[]) => {
    setPhase({ kind: 'end', summary });
  }, []);

  const Icon = game.icon;
  if (phase.kind === 'start') {
    return (
      <section className={styles.card} aria-labelledby="game-start-title">
        <span className={styles.bigEmoji} aria-hidden="true">
          {game.emoji}
        </span>
        <h2 id="game-start-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          {game.name}
        </h2>
        <p className={styles.instruction}>{game.instruction}</p>
        <div className={styles.levels} role="group" aria-label="مستوى الصعوبة">
          {DIFFICULTIES.map((option) => (
            <button
              key={option}
              type="button"
              className={cx(styles.level, option === difficulty && styles.levelOn)}
              aria-pressed={option === difficulty}
              onClick={() => {
                setDifficulty(option);
              }}
            >
              {DIFFICULTY_LABELS[option]}
            </button>
          ))}
        </div>
        <Button
          size="lg"
          className={styles.start}
          iconStart={<Play aria-hidden="true" />}
          onClick={play}
        >
          ابدأ اللعب
        </Button>
      </section>
    );
  }

  if (phase.kind === 'end') {
    return (
      <section className={styles.card} aria-labelledby="game-end-title">
        <span className={styles.bigEmoji} aria-hidden="true">
          🎉
        </span>
        <h2 id="game-end-title" ref={headingRef} tabIndex={-1} className={styles.title}>
          أحسنت!
        </h2>
        <p className={styles.instruction}>أنهيت اللعبة بنجاح</p>
        <dl className={styles.summary} aria-label="ملخص اللعب">
          {phase.summary.map((figure) => (
            <div key={figure.label} className={styles.figure}>
              <dt>{figure.label}</dt>
              <dd>{figure.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.actions}>
          <Button size="lg" iconStart={<RotateCcw aria-hidden="true" />} onClick={play}>
            العب مرة أخرى
          </Button>
          <Link to={exitTo} className={getButtonClassName({ variant: 'outline', size: 'lg' })}>
            <ArrowRight aria-hidden="true" />
            {exitLabel}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.play} aria-labelledby="game-play-title">
      <header className={styles.playHead}>
        <span className={styles.playIcon} aria-hidden="true">
          <Icon />
        </span>
        <h2 id="game-play-title" ref={headingRef} tabIndex={-1} className={styles.playTitle}>
          {game.name}
        </h2>
        <span className={styles.badge}>{DIFFICULTY_LABELS[difficulty]}</span>
      </header>
      <RealGameBoard
        key={phase.run}
        slug={game.slug}
        difficulty={difficulty}
        onComplete={complete}
        {...(random ? { random } : {})}
      />
    </section>
  );
}
