import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { ChoiceQuiz } from '@/features/activities/games/shared/ChoiceQuiz';
import { useQuizRounds } from '@/features/activities/games/shared/useQuizRounds';
import type { GameProps } from '@/features/activities/games/types';
import { cx } from '@/utils/classNames';

import { PATTERN_ROUNDS } from './content';
import styles from './PatternLogicGame.module.css';

/** 3×3 picture matrix with a missing cell (Replit «المتاهة المنطقية»). */
export function PatternLogicGame({ onFinish, sound }: GameProps) {
  const quiz = useQuizRounds(PATTERN_ROUNDS, sound, onFinish);
  const { round } = quiz;

  return (
    <ChoiceQuiz
      quiz={quiz}
      noun="اللغز"
      answersLabel="اختر الشكل الناقص"
      feedbackText={`${quiz.wasCorrect ? 'أحسنت! ' : ''}${round.explanation}`}
      stimulus={
        <>
          <p className={sharedStyles.prompt}>{round.question}</p>
          <ul className={styles.grid} aria-label="شبكة النمط">
            {round.grid.flatMap((row, rowIndex) =>
              row.map((cell, cellIndex) => (
                <li
                  key={`${rowIndex.toString()}-${cellIndex.toString()}`}
                  className={cx(styles.cell, cell === null && styles.missing)}
                >
                  {cell ?? (
                    <>
                      <span aria-hidden="true">؟</span>
                      <span className="visually-hidden">خانة ناقصة</span>
                    </>
                  )}
                </li>
              )),
            )}
          </ul>
        </>
      }
      options={round.options.map((option) => ({ value: option, label: option }))}
    />
  );
}
