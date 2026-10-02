import { Check, Star } from 'lucide-react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import { Button } from '@/components/ui/Button';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import { TapToPlaceBoard } from '@/features/activities/games/shared/TapToPlaceBoard';
import { useBuildRounds } from '@/features/activities/games/shared/useBuildRounds';
import type { GameProps } from '@/features/activities/games/types';

import { SCRAMBLE_ROUNDS } from './content';
import styles from './WordScrambleGame.module.css';

/** Tap the letters in order to spell the word (Replit «رتّب الحروف» — now finishes and reports). */
export function WordScrambleGame({ onFinish, sound }: GameProps) {
  const game = useBuildRounds(SCRAMBLE_ROUNDS, sound, onFinish);

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={game.position}
        total={game.total}
        noun="الكلمة"
        extra={
          <StatPill icon={Star} tone="accent">
            {`صحيح: ${game.correctCount.toString()}`}
          </StatPill>
        }
      />
      <div className={styles.hint}>
        <span className={styles.hintEmoji} aria-hidden="true">
          {game.round.emoji}
        </span>
        <p className={styles.hintText}>{`تلميح: ${game.round.hint}`}</p>
      </div>
      <TapToPlaceBoard
        kind="letter"
        state={game.state}
        onPlace={game.place}
        onRemove={game.remove}
        lineLabel="الكلمة"
        trayLabel="الحروف"
        result={game.result}
        isLocked={game.result !== null}
      />
      <FeedbackMessage
        kind={game.result}
        text={
          game.result
            ? `${game.result === 'correct' ? 'أحسنت! ' : ''}الكلمة هي: ${game.round.word}`
            : undefined
        }
      />
      <div className={sharedStyles.actions}>
        {game.result ? (
          <NextButton isLast={game.isLast} onClick={game.next} />
        ) : (
          <Button
            size="lg"
            iconStart={<Check aria-hidden="true" />}
            disabled={!game.canCheck}
            onClick={game.check}
          >
            تحقق
          </Button>
        )}
      </div>
    </div>
  );
}
