import { mediaKeys } from '@/services/media/localMedia';
import { Check } from 'lucide-react';

import { ServerImage } from '@/components/shared/ServerImage';
import { cx } from '@/utils/classNames';

import type { GameOption } from '../types';

import { optionName } from './optionName';
import styles from './Game.module.css';

export interface GameOptionCardProps {
  option: GameOption;
  /** Position in the question (colour + fallback label). */
  index: number;
  isSelected: boolean;
  /** Sequence: the 1-based place the child gave this card. */
  orderBadge?: number | undefined;
  /** `letter` / `number`: the option text is the hero of the card. */
  look?: 'letter' | 'number' | 'card';
  disabled?: boolean | undefined;
  onPress: () => void;
}

const SWATCHES = 6;

/**
 * One large, colourful, tappable option card (a native button). Shows the server's option image
 * when there is one (hidden if it fails to load), otherwise the option text in large type.
 */
export function GameOptionCard({
  option,
  index,
  isSelected,
  orderBadge,
  look = 'card',
  disabled,
  onPress,
}: GameOptionCardProps) {
  const name = optionName(option, index);
  let state = '';
  if (orderBadge !== undefined) state = ` — الترتيب ${orderBadge.toString()}`;
  else if (isSelected) state = ' — مختارة';
  return (
    <button
      type="button"
      className={cx(styles.option, styles[look], isSelected && styles.selected)}
      data-swatch={(index % SWATCHES).toString()}
      aria-pressed={isSelected}
      aria-label={`${name}${state}`}
      disabled={disabled}
      onClick={onPress}
    >
      {orderBadge !== undefined ? (
        <span className={styles.orderBadge} aria-hidden="true">
          {orderBadge}
        </span>
      ) : null}
      {isSelected && orderBadge === undefined ? (
        <span className={styles.check} aria-hidden="true">
          <Check />
        </span>
      ) : null}
      <ServerImage
        path={option.imageUrl}
        mediaKey={mediaKeys.option(option.id)}
        alt=""
        className={styles.optionImage}
      />
      {option.text.trim() ? (
        <span className={styles.optionText} aria-hidden="true">
          <bdi>{option.text}</bdi>
        </span>
      ) : null}
    </button>
  );
}
