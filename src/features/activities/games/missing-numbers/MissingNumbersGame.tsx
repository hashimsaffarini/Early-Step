import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { ChoiceQuiz } from '@/features/activities/games/shared/ChoiceQuiz';
import { useQuizRounds } from '@/features/activities/games/shared/useQuizRounds';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { MISSING_NUMBER_ROUNDS } from './content';
import styles from './MissingNumbersGame.module.css';

/**
 * Sequence with one gap → choose the missing number (Replit «الأرقام المفقودة»).
 * Unlike Replit, the rule («+2») is not shown, so it no longer gives the answer away.
 */
export function MissingNumbersGame({ onFinish, sound }: GameProps) {
  const quiz = useQuizRounds(MISSING_NUMBER_ROUNDS, sound, onFinish);
  const { round } = quiz;
  const spoken = round.sequence.map((value) => value ?? 'فراغ').join('، ');

  return (
    <ChoiceQuiz
      quiz={quiz}
      noun="التسلسل"
      answersLabel="اختر الرقم الناقص"
      stimulus={
        <>
          <p className={sharedStyles.prompt}>ما الرقم الناقص؟</p>
          <ol className={styles.sequence} dir="ltr" aria-label={`التسلسل: ${spoken}`}>
            {round.sequence.map((value, index) => (
              <li
                key={index}
                className={cx(
                  styles.number,
                  value === null && styles.gap,
                  value === null && quiz.isAnswered && styles.filled,
                )}
                aria-hidden="true"
              >
                {value ?? (quiz.isAnswered ? round.answer : '؟')}
              </li>
            ))}
          </ol>
        </>
      }
      options={round.options.map((option) => ({ value: option, label: option }))}
    />
  );
}
