import { useState } from 'react';

import type { SoundEffects } from '@/components/players';

import type { GameResult } from '../types';

import {
  createPlaceState,
  matchesAnswer,
  placeToken,
  removeToken,
  type PlaceState,
} from './tapToPlace';

export interface BuildRound {
  /** Chips in one accepted order. */
  tokens: readonly string[];
  /** Every accepted order (Arabic allows several word orders). */
  accepted: readonly (readonly string[])[];
}

export interface BuildRounds<TRound extends BuildRound> {
  round: TRound;
  position: number;
  total: number;
  correctCount: number;
  state: PlaceState;
  result: 'correct' | 'wrong' | null;
  canCheck: boolean;
  isLast: boolean;
  place: (id: string) => void;
  remove: (id: string) => void;
  check: () => void;
  next: () => void;
}

/** Build-the-answer rounds (sentence builder, word scramble): place chips → «تحقق» → «التالي». */
export function useBuildRounds<TRound extends BuildRound>(
  rounds: readonly TRound[],
  sound: SoundEffects,
  onFinish: (result: GameResult) => void,
): BuildRounds<TRound> {
  const [index, setIndex] = useState(0);
  const [state, setState] = useState<PlaceState>(() => createPlaceState(rounds[0]?.tokens ?? []));
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const round = rounds[index] ?? rounds[0];
  if (!round) throw new Error('useBuildRounds: no rounds');
  const isLast = index === rounds.length - 1;

  const place = (id: string) => {
    if (result) return;
    sound.play('tap');
    setState((current) => placeToken(current, id));
  };

  const remove = (id: string) => {
    if (result) return;
    setState((current) => removeToken(current, id));
  };

  const check = () => {
    if (result || state.tray.length > 0) return;
    if (matchesAnswer(state.placed, round.accepted)) {
      setResult('correct');
      setCorrectCount((count) => count + 1);
      sound.play('correct');
    } else {
      setResult('wrong');
      sound.play('wrong');
    }
  };

  const next = () => {
    if (!result) return;
    if (isLast) {
      onFinish({ correct: correctCount, total: rounds.length });
      return;
    }
    const nextRound = rounds[index + 1];
    if (!nextRound) return;
    setIndex(index + 1);
    setState(createPlaceState(nextRound.tokens));
    setResult(null);
  };

  return {
    round,
    position: index + 1,
    total: rounds.length,
    correctCount,
    state,
    result,
    canCheck: state.tray.length === 0 && result === null,
    isLast,
    place,
    remove,
    check,
    next,
  };
}
