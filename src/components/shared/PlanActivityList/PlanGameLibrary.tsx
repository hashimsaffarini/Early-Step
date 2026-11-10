import { mediaKeys } from '@/services/media/localMedia';
import { CircleCheck, Gamepad2, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { resolveRealGame } from '@/components/games';
import { ServerImage } from '@/components/shared/ServerImage';
import { getButtonClassName } from '@/components/ui/Button';
import type { PlanActivity } from '@/services/api/childPlan';
import { cx } from '@/utils/classNames';

import { playLabel, statusLabel } from './activityWording';
import styles from './PlanGameLibrary.module.css';

interface PlanGameLibraryProps {
  games: readonly PlanActivity[];
  playTo: (activity: PlanActivity) => string;
}

/**
 * Parent: the plan's games as a library of large, colourful cards (client revision 2026-11), so
 * games read differently from the test list. A known game slug adds its skill and picture; the
 * server's title and description always win. Every game stays replayable.
 */
export function PlanGameLibrary({ games, playTo }: PlanGameLibraryProps) {
  return (
    <ul className={styles.grid} aria-label="مكتبة الألعاب">
      {games.map((activity) => {
        const game = resolveRealGame(activity.slug);
        const title = activity.title || (game?.name ?? 'لعبة');
        const description = activity.description || (game?.tagline ?? '');
        return (
          <li key={activity.id} className={cx(styles.card, activity.isCompleted && styles.done)}>
            <span className={styles.art} aria-hidden="true">
              <ServerImage
                path={activity.iconUrl}
                mediaKey={mediaKeys.activity('game', activity.activityId)}
                alt=""
                className={styles.image}
                fallback={game ? <span className={styles.emoji}>{game.emoji}</span> : <Gamepad2 />}
              />
            </span>
            <h3 className={styles.title}>{title}</h3>
            {description ? <p className={styles.description}>{description}</p> : null}
            <div className={styles.chips}>
              {game ? (
                <span className={styles.skill}>
                  <Sparkles aria-hidden="true" />
                  {game.skill}
                </span>
              ) : null}
              {activity.isCompleted ? (
                <span className={styles.status}>
                  <CircleCheck aria-hidden="true" />
                  {statusLabel(activity)}
                </span>
              ) : null}
            </div>
            <Link
              to={playTo(activity)}
              className={cx(
                getButtonClassName({
                  size: 'lg',
                  variant: activity.isCompleted ? 'outline' : 'accent',
                }),
                styles.cta,
              )}
              aria-label={`${playLabel(activity)}: ${title}`}
            >
              {activity.isCompleted ? (
                <RotateCcw aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
              {playLabel(activity)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
