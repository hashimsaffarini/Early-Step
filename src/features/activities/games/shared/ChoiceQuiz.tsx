import { Star } from 'lucide-react';
import type { ReactNode } from 'react';

import { AnswerTile, FeedbackMessage, QuestionProgress, StatPill } from '@/components/players';

import styles from './game.module.css';
import { NextButton } from './NextButton';
import type { QuizRounds } from './useQuizRounds';

export interface ChoiceOption {
  value: string;
  label: string;
  emoji?: string | undefined;
}

export interface ChoiceQuizProps<TRound extends { answer: string }> {
  quiz: QuizRounds<TRound>;
  noun?: string;
  /** Question area (stimulus, prompt) for the current round. */
  stimulus: ReactNode;
  options: readonly ChoiceOption[];
  /** Group label for the answer buttons. */
  answersLabel: string;
  /** Text shown after a correct/incorrect answer (defaults to the shared phrases). */
  feedbackText?: string | undefined;
}

/** Stimulus + 2×2 answer tiles + feedback + «التالي» (reading, numbers, listening, patterns…). */
export function ChoiceQuiz<TRound extends { answer: string }>({
  quiz,
  noun = 'السؤال',
  stimulus,
  options,
  answersLabel,
  feedbackText,
}: ChoiceQuizProps<TRound>) {
  let feedbackKind: 'correct' | 'wrong' | null = null;
  if (quiz.isAnswered) feedbackKind = quiz.wasCorrect ? 'correct' : 'wrong';

  return (
    <div className={styles.game}>
      <QuestionProgress
        current={quiz.position}
        total={quiz.total}
        noun={noun}
        extra={
          <StatPill icon={Star} tone="accent">
            {`صحيح: ${quiz.correctCount.toString()}`}
          </StatPill>
        }
      />
      {stimulus}
      <div className={styles.answers} role="group" aria-label={answersLabel}>
        {options.map((option) => (
          <AnswerTile
            key={option.value}
            label={option.label}
            emoji={option.emoji}
            state={quiz.tileState(option.value)}
            disabled={quiz.isAnswered}
            onClick={() => {
              quiz.answer(option.value);
            }}
          />
        ))}
      </div>
      <FeedbackMessage kind={feedbackKind} text={quiz.isAnswered ? feedbackText : undefined} />
      {quiz.isAnswered ? (
        <div className={styles.actions}>
          <NextButton isLast={quiz.isLast} onClick={quiz.next} />
        </div>
      ) : null}
    </div>
  );
}
