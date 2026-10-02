import { Search, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { firstOf } from '@/features/activities/games/shared/firstOf';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { SPOT_LEVELS } from './content';
import { buildSpotGrid } from './spotLogic';
import styles from './SpotItGame.module.css';

const FIRST_LEVEL = firstOf(SPOT_LEVELS);

/** Find every copy of the target picture (Replit «ابحث وجِد!» — no timer, and it now finishes). */
export function SpotItGame({ onFinish, sound }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [found, setFound] = useState<ReadonlySet<string>>(new Set());
  const [missId, setMissId] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const level = SPOT_LEVELS[levelIndex] ?? FIRST_LEVEL;
  const grid = useMemo(() => buildSpotGrid(level), [level]);
  const isLevelDone = found.size === level.count;
  const isLast = levelIndex === SPOT_LEVELS.length - 1;

  const tap = (cellId: string, isTarget: boolean) => {
    if (isLevelDone || found.has(cellId)) return;
    if (isTarget) {
      setFound(new Set(found).add(cellId));
      setTotalFound((count) => count + 1);
      setMissId(null);
      sound.play(found.size + 1 === level.count ? 'correct' : 'tap');
    } else {
      setMissId(cellId);
      setMistakes((count) => count + 1);
      sound.play('wrong');
    }
  };

  const next = () => {
    if (isLast) {
      onFinish({
        correct: totalFound,
        total: totalFound + mistakes,
        summary: `وجدت ${totalFound.toString()} صورة، مع ${mistakes.toString()} محاولات في غير مكانها`,
      });
      return;
    }
    setLevelIndex(levelIndex + 1);
    setFound(new Set());
    setMissId(null);
  };

  let feedbackKind: 'correct' | 'wrong' | null = null;
  if (isLevelDone) feedbackKind = 'correct';
  else if (missId) feedbackKind = 'wrong';

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={levelIndex + 1}
        total={SPOT_LEVELS.length}
        noun="المستوى"
        extra={
          <StatPill icon={Star} tone="success">
            {`وجدت: ${found.size.toString()} من ${level.count.toString()}`}
          </StatPill>
        }
      />
      <div className={styles.mission}>
        <Search aria-hidden="true" />
        <p className={styles.missionText}>{`ابحث عن كل ${level.target.name}`}</p>
        <span className={styles.targetEmoji} aria-hidden="true">
          {level.target.emoji}
        </span>
      </div>
      <ul className={styles.grid} aria-label="الصور">
        {grid.map((cell) => {
          const isFound = found.has(cell.id);
          return (
            <li key={cell.id}>
              <button
                type="button"
                className={cx(
                  styles.cell,
                  isFound && styles.found,
                  missId === cell.id && styles.miss,
                )}
                aria-label={isFound ? `${cell.name} (وجدتها)` : cell.name}
                disabled={isFound || isLevelDone}
                onClick={() => {
                  tap(cell.id, cell.isTarget);
                }}
              >
                <span aria-hidden="true">{cell.emoji}</span>
                {isFound ? (
                  <span className={styles.foundMark} aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <FeedbackMessage
        kind={feedbackKind}
        text={isLevelDone ? 'أحسنت! وجدتها كلها' : `هذه ليست ${level.target.name}، ابحث مرة أخرى`}
      />
      {isLevelDone ? (
        <div className={sharedStyles.actions}>
          <NextButton
            isLast={isLast}
            onClick={next}
            label={isLast ? 'إنهاء اللعبة' : 'المستوى التالي'}
          />
        </div>
      ) : null}
    </div>
  );
}
