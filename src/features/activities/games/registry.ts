import type { ComponentType } from 'react';

import type { GameId } from '@/features/activities/data/games';

import { BalloonPopGame } from './balloon-pop/BalloonPopGame';
import { ColorMemoryGame } from './color-memory/ColorMemoryGame';
import { ListenChooseGame } from './listen-choose/ListenChooseGame';
import { MemoryMatchGame } from './memory-match/MemoryMatchGame';
import { MissingNumbersGame } from './missing-numbers/MissingNumbersGame';
import { PatternLogicGame } from './pattern-logic/PatternLogicGame';
import { SentenceBuilderGame } from './sentence-builder/SentenceBuilderGame';
import { SpotItGame } from './spot-it/SpotItGame';
import { StorySequenceGame } from './story-sequence/StorySequenceGame';
import type { GameProps } from './types';
import { WordReadingGame } from './word-reading/WordReadingGame';
import { WordScrambleGame } from './word-scramble/WordScrambleGame';

/** Which component plays which game. */
export const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  'memory-match': MemoryMatchGame,
  'word-reading': WordReadingGame,
  'missing-numbers': MissingNumbersGame,
  'sentence-builder': SentenceBuilderGame,
  'pattern-logic': PatternLogicGame,
  'color-memory': ColorMemoryGame,
  'listen-choose': ListenChooseGame,
  'balloon-pop': BalloonPopGame,
  'word-scramble': WordScrambleGame,
  'spot-it': SpotItGame,
  'story-sequence': StorySequenceGame,
};
