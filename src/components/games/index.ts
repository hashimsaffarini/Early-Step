export {
  buildGameSlug,
  engineFor,
  GAME_TEMPLATE_LIST,
  GAME_TEMPLATES,
  gameSlugSuffix,
  resolveGameTemplate,
} from './registry';
export { GameChallenge } from './shared/GameChallenge';
export { GameStage, type GameStageProps } from './shared/GameStage';
export {
  GAME_SLUGS,
  type ChallengeProps,
  type GameOption,
  type GameQuestion,
  type GameSlug,
  type GameTemplate,
} from './types';
export {
  DEFAULT_REAL_GAME,
  difficultyForAge,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  REAL_GAME_LIST,
  REAL_GAME_SLUGS,
  REAL_GAMES,
  RealGameSession,
  resolveRealGame,
  type Difficulty,
  type RealGameDefinition,
  type RealGameSlug,
  type SessionFigure,
} from './real';
