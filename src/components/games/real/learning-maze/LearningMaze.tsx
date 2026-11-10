import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';

import { cx } from '@/utils/classNames';

import type { EngineProps, MazeLevel } from '../types';

import styles from './LearningMaze.module.css';

interface Point {
  row: number;
  col: number;
}

const WALL = '#';
const START = 'S';
const PLAYER = '🐢';
const MOVE_HINT = 'استخدم الأسهم لتحريك السلحفاة.';

/** Screen directions (the board is laid out left→right like a picture, also in RTL pages). */
const MOVES = {
  up: { row: -1, col: 0, label: 'أعلى', icon: ArrowUp },
  down: { row: 1, col: 0, label: 'أسفل', icon: ArrowDown },
  left: { row: 0, col: -1, label: 'يسار', icon: ArrowLeft },
  right: { row: 0, col: 1, label: 'يمين', icon: ArrowRight },
} as const;
type Direction = keyof typeof MOVES;

const KEYS: Readonly<Record<string, Direction>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

function findStart(grid: readonly string[]): Point {
  for (const [row, line] of grid.entries()) {
    const col = line.indexOf(START);
    if (col >= 0) return { row, col };
  }
  return { row: 0, col: 0 };
}

/**
 * «متاهة التعلم» — move the turtle through the maze (arrow buttons, or the keyboard arrows on the
 * board) to the requested target. Walls block; a wrong target only says to look again. Reaching
 * the correct target ends the game. Moves are counted for the summary.
 */
export function LearningMaze({ level, onComplete }: EngineProps<MazeLevel>) {
  const [position, setPosition] = useState<Point>(() => findStart(level.grid));
  const [moves, setMoves] = useState(0);
  const [reached, setReached] = useState(false);
  const goal = level.targets[level.correct];
  const [message, setMessage] = useState(MOVE_HINT);
  const finished = useRef(false);
  const columns = level.grid[0]?.length ?? 0;

  useEffect(() => {
    if (!reached || finished.current) return;
    finished.current = true;
    onComplete([
      { label: 'الهدف', value: `تم الوصول إلى ${goal?.label ?? 'الهدف'}` },
      { label: 'عدد الخطوات', value: moves.toString() },
    ]);
  }, [reached, moves, goal, onComplete]);

  const move = (direction: Direction) => {
    if (reached) return;
    const step = MOVES[direction];
    const next = { row: position.row + step.row, col: position.col + step.col };
    const cell = level.grid[next.row]?.[next.col];
    if (cell === undefined || cell === WALL) {
      setMessage('هنا جدار، جرّب اتجاهاً آخر.');
      return;
    }
    setPosition(next);
    setMoves((value) => value + 1);
    const target = level.targets[cell];
    if (!target) {
      setMessage(MOVE_HINT);
      return;
    }
    if (cell === level.correct) {
      setReached(true);
      setMessage(`أحسنت! وصلت إلى ${target.label}.`);
      return;
    }
    setMessage(`هذا ${target.label}، ابحث عن ${goal?.label ?? 'الهدف'}.`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const direction = KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    move(direction);
  };

  return (
    <div className={styles.game}>
      <p className={styles.prompt}>{level.prompt}</p>
      <p className={styles.status} role="status">
        {message}
      </p>
      <div
        className={styles.board}
        dir="ltr"
        role="grid"
        aria-label="المتاهة — استخدم الأسهم للتحرّك"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{ '--columns': columns.toString() } as CSSProperties}
      >
        {level.grid.map((line, row) => (
          <div key={`row-${row.toString()}`} role="row" className={styles.row}>
            {Array.from({ length: line.length }, (_, col) => line.charAt(col)).map((cell, col) => {
              const isPlayer = position.row === row && position.col === col;
              const target = level.targets[cell];
              let name = 'طريق';
              if (cell === WALL) name = 'جدار';
              else if (target) name = target.label;
              if (isPlayer) name = `السلحفاة${target ? ` عند ${target.label}` : ''}`;
              return (
                <div
                  key={`cell-${col.toString()}`}
                  role="gridcell"
                  aria-label={name}
                  className={cx(
                    styles.cell,
                    cell === WALL && styles.wall,
                    target && styles.target,
                    isPlayer && styles.player,
                    isPlayer && reached && styles.won,
                  )}
                >
                  <span aria-hidden="true">{isPlayer ? PLAYER : (target?.emoji ?? '')}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.pad} dir="ltr" role="group" aria-label="أزرار التحرّك">
        {(['up', 'left', 'right', 'down'] as const).map((direction) => {
          const { icon: Icon, label } = MOVES[direction];
          return (
            <button
              key={direction}
              type="button"
              className={cx(styles.key, styles[direction])}
              aria-label={label}
              disabled={reached}
              onClick={() => {
                move(direction);
              }}
            >
              <Icon aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
