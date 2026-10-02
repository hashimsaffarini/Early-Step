import { Star } from 'lucide-react';

import { FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { NextButton } from '@/features/activities/games/shared/NextButton';
import { useQuizRounds } from '@/features/activities/games/shared/useQuizRounds';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import styles from './BalloonPopGame.module.css';
import { BALLOON_ROUNDS } from './content';

const TONES = [styles.tone0, styles.tone1, styles.tone2, styles.tone3] as const;

/**
 * Solve the sum, pop the balloon with the answer (Replit «فقّع البالون»).
 * Balloons float gently in place (no moving targets, still with reduced motion), labels are large
 * and each balloon is a ≥ 5rem button.
 */
export function BalloonPopGame({ onFinish, sound }: GameProps) {
  const quiz = useQuizRounds(BALLOON_ROUNDS, sound, onFinish);
  const { round } = quiz;
  let feedbackKind: 'correct' | 'wrong' | null = null;
  if (quiz.isAnswered) feedbackKind = quiz.wasCorrect ? 'correct' : 'wrong';

  const balloonClass = (option: string) => {
    const state = quiz.tileState(option);
    if (state === 'correct') return styles.popped;
    if (state === 'wrong') return styles.missed;
    if (state === 'dimmed') return styles.faded;
    return undefined;
  };

  return (
    <div className={sharedStyles.game}>
      <QuestionProgress
        current={quiz.position}
        total={quiz.total}
        extra={
          <StatPill icon={Star} tone="accent">
            {`صحيح: ${quiz.correctCount.toString()}`}
          </StatPill>
        }
      />
      <div className={styles.question}>
        <p className={sharedStyles.hint}>فقّع البالون الذي يحمل الإجابة</p>
        <p className={styles.expression}>
          <bdi dir="ltr" aria-hidden="true">{`${round.expression} = ?`}</bdi>
          <span className="visually-hidden">{`${round.spoken} يساوي كم؟`}</span>
        </p>
      </div>
      <div className={styles.sky} role="group" aria-label="البالونات">
        {round.options.map((option, index) => {
          const state = quiz.tileState(option);
          return (
            <button
              key={option}
              type="button"
              className={cx(styles.balloon, TONES[index % TONES.length], balloonClass(option))}
              disabled={quiz.isAnswered}
              onClick={() => {
                quiz.answer(option);
              }}
            >
              <span className={styles.label}>{option}</span>
              {state === 'correct' ? <span className={styles.stateText}>✓ صحيح</span> : null}
              {state === 'wrong' ? <span className={styles.stateText}>✗ ليس هذا</span> : null}
            </button>
          );
        })}
      </div>
      <FeedbackMessage
        kind={feedbackKind}
        text={
          quiz.isAnswered && !quiz.wasCorrect ? `الإجابة الصحيحة هي ${round.answer}` : undefined
        }
      />
      {quiz.isAnswered ? (
        <div className={sharedStyles.actions}>
          <NextButton isLast={quiz.isLast} onClick={quiz.next} />
        </div>
      ) : null}
    </div>
  );
}
