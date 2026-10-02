import { Check, Star } from 'lucide-react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import { Button } from '@/components/ui/Button';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import { TapToPlaceBoard } from '@/features/activities/games/shared/TapToPlaceBoard';
import { useBuildRounds } from '@/features/activities/games/shared/useBuildRounds';
import type { GameProps } from '@/features/activities/games/types';

import { SENTENCE_ROUNDS } from './content';

/** Tap the words in order to build the sentence (Replit «تشكيل الجمل», tap instead of drag). */
export function SentenceBuilderGame({ onFinish, sound }: GameProps) {
  const game = useBuildRounds(SENTENCE_ROUNDS, sound, onFinish);
  const correctSentence = game.round.tokens.join(' ');

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={game.position}
        total={game.total}
        noun="الجملة"
        extra={
          <StatPill icon={Star} tone="accent">
            {`صحيح: ${game.correctCount.toString()}`}
          </StatPill>
        }
      />
      <div className={sharedStyles.stimulus}>
        <span className={sharedStyles.stimulusEmoji} aria-hidden="true">
          {game.round.emoji}
        </span>
        <p className={sharedStyles.prompt}>رتّب الكلمات لتكوّن جملة صحيحة</p>
      </div>
      <TapToPlaceBoard
        kind="word"
        state={game.state}
        onPlace={game.place}
        onRemove={game.remove}
        lineLabel="جملتك"
        trayLabel="الكلمات"
        result={game.result}
        isLocked={game.result !== null}
      />
      <FeedbackMessage
        kind={game.result}
        text={game.result === 'wrong' ? `الجملة الصحيحة: ${correctSentence}` : undefined}
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
