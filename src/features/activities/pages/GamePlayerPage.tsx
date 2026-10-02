import { Home, RotateCcw, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import {
  Confetti,
  PlayerBanner,
  PlayerShell,
  ResultPanel,
  SoundToggle,
  StartScreen,
  starsForScore,
  useSoundEffects,
} from '@/components/players';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ACTIVITY_DIFFICULTY_DISPLAY } from '@/constants/activityCategories';
import { findGame, type GameDefinition } from '@/features/activities/data/games';
import { GAME_COMPONENTS } from '@/features/activities/games/registry';
import type { GameResult } from '@/features/activities/games/types';
import { useRoleArea } from '@/hooks/useRoleArea';

import styles from './GamePlayerPage.module.css';
import { getResultSummary, getResultTitle } from './gameResultText';

type Phase = { name: 'start' } | { name: 'playing' } | { name: 'result'; result: GameResult };

const ALL_GAMES_LABEL = 'كل الألعاب';

/** Full-screen game player (Replit `/games/:id/play`): start → play → result. Local state only. */
export function GamePlayerPage() {
  const { gameId } = useParams();
  const game = findGame(gameId);
  const { paths } = useRoleArea();
  const sound = useSoundEffects();

  if (!game) {
    return (
      <PlayerShell exitTo={paths.games} title="اللعبة غير موجودة" category="neutral" emoji="🎮">
        <div className={styles.notFound}>
          <EmptyState
            icon={<SearchX />}
            title="لم نجد هذه اللعبة"
            description="قد يكون الرابط غير صحيح. اختر لعبة من قائمة الألعاب."
            action={
              <Link to={paths.games} className={getButtonClassName()}>
                {ALL_GAMES_LABEL}
              </Link>
            }
          />
        </div>
      </PlayerShell>
    );
  }

  return (
    <PlayerShell
      exitTo={paths.games}
      title={game.title}
      category={game.category}
      emoji={game.emoji}
      end={<SoundToggle isMuted={sound.isMuted} onToggle={sound.toggleMuted} />}
    >
      <GameSession key={game.id} game={game} gamesPath={paths.games} sound={sound} />
    </PlayerShell>
  );
}

interface GameSessionProps {
  game: GameDefinition;
  gamesPath: string;
  sound: ReturnType<typeof useSoundEffects>;
}

function GameSession({ game, gamesPath, sound }: GameSessionProps) {
  const [phase, setPhase] = useState<Phase>({ name: 'start' });
  const [attempt, setAttempt] = useState(0);
  const Game = GAME_COMPONENTS[game.id];
  const difficulty = ACTIVITY_DIFFICULTY_DISPLAY[game.difficulty].label;

  if (phase.name === 'start') {
    return (
      <StartScreen
        category={game.category}
        emoji={game.emoji}
        title={game.title}
        description={game.description}
        badge={difficulty}
        instructions={game.instructions}
        onStart={() => {
          setPhase({ name: 'playing' });
        }}
      />
    );
  }

  if (phase.name === 'result') {
    const { result } = phase;
    return (
      <>
        <Confetti />
        <ResultPanel
          category={game.category}
          title={getResultTitle(result)}
          scoreText={getResultSummary(result)}
          stars={starsForScore(result.correct, result.total)}
          actions={
            <>
              <Button
                size="lg"
                iconStart={<RotateCcw aria-hidden="true" />}
                onClick={() => {
                  setAttempt((count) => count + 1);
                  setPhase({ name: 'start' });
                }}
              >
                العب مرة أخرى
              </Button>
              <Link
                to={gamesPath}
                className={getButtonClassName({ variant: 'outline', size: 'lg' })}
              >
                <Home aria-hidden="true" />
                {ALL_GAMES_LABEL}
              </Link>
            </>
          }
        />
      </>
    );
  }

  return (
    <>
      <PlayerBanner
        category={game.category}
        emoji={game.emoji}
        title={game.title}
        description={game.description}
        badge={difficulty}
      />
      <Card>
        <Game
          key={attempt}
          sound={sound}
          onFinish={(result) => {
            sound.play('win');
            setPhase({ name: 'result', result });
          }}
        />
      </Card>
    </>
  );
}
