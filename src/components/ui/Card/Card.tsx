import type { HTMLAttributes } from 'react';

import { cx } from '@/utils/classNames';

import styles from './Card.module.css';

type CardPadding = 'none' | 'compact' | 'default';
type CardElement = 'div' | 'section' | 'article' | 'li';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  padding?: CardPadding;
  /** Hover lift + highlighted border (for clickable cards). */
  isInteractive?: boolean;
}

const PADDING_CLASS: Record<CardPadding, string | undefined> = {
  none: undefined,
  compact: styles.compact,
  default: styles.padded,
};

export function Card({
  as: Element = 'div',
  padding = 'default',
  isInteractive = false,
  className,
  ...rest
}: CardProps) {
  return (
    <Element
      className={cx(
        styles.card,
        PADDING_CLASS[padding],
        isInteractive && styles.interactive,
        className,
      )}
      {...rest}
    />
  );
}
