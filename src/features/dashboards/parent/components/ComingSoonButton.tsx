import type { ReactNode } from 'react';

import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';

import styles from './ComingSoonButton.module.css';

const SOON_LABEL = 'قريباً';

export interface ComingSoonButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconStart?: ReactNode;
}

/**
 * Visual placeholder for an action whose screen is not built yet: a disabled button
 * (not a link) with a visible "قريباً" label, so nothing leads to an unfinished page.
 */
export function ComingSoonButton({
  children,
  variant = 'soft',
  size = 'sm',
  fullWidth,
  iconStart,
}: ComingSoonButtonProps) {
  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} iconStart={iconStart} disabled>
      {children}
      <span className={styles.soon}>{SOON_LABEL}</span>
    </Button>
  );
}
