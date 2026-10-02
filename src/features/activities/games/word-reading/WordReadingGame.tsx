import styles from '@/features/activities/games/shared/game.module.css';
import { ChoiceQuiz } from '@/features/activities/games/shared/ChoiceQuiz';
import { useQuizRounds } from '@/features/activities/games/shared/useQuizRounds';
import type { GameProps } from '@/features/activities/games/types';

import { WORD_READING_ROUNDS } from './content';

/** Picture + vocalised word → pick the matching written word (Replit «الكلمات المتقاطعة»). */
export function WordReadingGame({ onFinish, sound }: GameProps) {
  const quiz = useQuizRounds(WORD_READING_ROUNDS, sound, onFinish);
  const { round } = quiz;

  return (
    <ChoiceQuiz
      quiz={quiz}
      answersLabel="اختر الكلمة"
      stimulus={
        <div className={styles.stimulus}>
          <span className={styles.stimulusEmoji} aria-hidden="true">
            {round.emoji}
          </span>
          <p className={styles.stimulusText}>{round.word}</p>
          <p className={styles.hint}>اختر الكلمة نفسها من الكلمات أدناه</p>
        </div>
      }
      options={round.options.map((option) => ({ value: option, label: option }))}
    />
  );
}
