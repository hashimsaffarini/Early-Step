import { useState } from 'react';

import type { AnswerTileState, SoundEffects } from '@/components/players';

import type { GameResult } from '../types';

export interface QuizRounds<TRound> {
  round: TRound;
  /** 1-based position for progress counters. */
  position: number;
  total: number;
  correctCount: number;
  isAnswered: boolean;
  wasCorrect: boolean;
  isLast: boolean;
  answer: (option: string) => void;
  next: () => void;
  tileState: (option: string) => AnswerTileState;
}

/**
 * One-answer-per-round quiz flow shared by the choice games: answer → feedback → «التالي».
 * The child moves on when ready (no auto-advance, no timer).
 */
export function useQuizRounds<TRound extends { answer: string }>(
  rounds: readonly TRound[],
  sound: SoundEffects,
  onFinish: (result: GameResult) => void,
): QuizRounds<TRound> {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const round = rounds[index] ?? rounds[0];
  if (!round) throw new Error('useQuizRounds: no rounds');
  const isAnswered = selected !== null;
  const wasCorrect = selected === round.answer;
  const isLast = index === rounds.length - 1;

  const answer = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    if (option === round.answer) {
      setCorrectCount((count) => count + 1);
      sound.play('correct');
    } else {
      sound.play('wrong');
    }
  };

  const next = () => {
    if (!isAnswered) return;
    if (isLast) {
      onFinish({ correct: correctCount, total: rounds.length });
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  };

  const tileState = (option: string): AnswerTileState => {
    if (!isAnswered) return 'idle';
    if (option === round.answer) return 'correct';
    if (option === selected) return 'wrong';
    return 'dimmed';
  };

  return {
    round,
    position: index + 1,
    total: rounds.length,
    correctCount,
    isAnswered,
    wasCorrect,
    isLast,
    answer,
    next,
    tileState,
  };
}
