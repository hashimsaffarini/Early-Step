import { Eye, Volume2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import sharedStyles from '@/features/activities/games/shared/game.module.css';
import { ChoiceQuiz } from '@/features/activities/games/shared/ChoiceQuiz';
import { useQuizRounds } from '@/features/activities/games/shared/useQuizRounds';
import type { GameProps } from '@/features/activities/games/types';

import { LISTEN_ROUNDS } from './content';
import styles from './ListenChooseGame.module.css';
import { isSpeechAvailable, speakArabic } from './speech';

/**
 * Hear a word, pick its picture (Replit «استمع واختر»). Speech only plays after a tap; where the
 * browser cannot speak, or the child cannot hear it, «أظهر الكلمة» shows the word instead.
 */
export function ListenChooseGame({ onFinish, sound }: GameProps) {
  const quiz = useQuizRounds(LISTEN_ROUNDS, sound, onFinish);
  const { round } = quiz;
  const [revealedWord, setRevealedWord] = useState<string | null>(null);
  const canSpeak = isSpeechAvailable();
  const isRevealed = revealedWord === round.word || !canSpeak;

  return (
    <ChoiceQuiz
      quiz={quiz}
      answersLabel="اختر الصورة"
      stimulus={
        <div className={styles.listen}>
          {canSpeak ? (
            <>
              <button
                type="button"
                className={styles.speaker}
                aria-label="استمع إلى الكلمة"
                onClick={() => {
                  speakArabic(round.word);
                }}
              >
                <Volume2 aria-hidden="true" />
              </button>
              <p className={sharedStyles.hint}>اضغط السماعة لتسمع الكلمة، ثم اختر صورتها</p>
            </>
          ) : (
            <p className={sharedStyles.hint}>
              الصوت غير متاح في هذا المتصفح — اقرأ الكلمة واختر صورتها
            </p>
          )}
          {isRevealed ? (
            <p className={styles.word}>{round.word}</p>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              iconStart={<Eye aria-hidden="true" />}
              onClick={() => {
                setRevealedWord(round.word);
              }}
            >
              أظهر الكلمة
            </Button>
          )}
        </div>
      }
      options={round.options.map((option) => ({
        value: option.value,
        label: option.value,
        emoji: option.emoji,
      }))}
    />
  );
}
