import { cx } from '@/utils/classNames';

import styles from './Avatar.module.css';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle';
  className?: string | undefined;
}

/** First letter of the name. Decorative: the name is always shown next to it. */
export function Avatar({ name, size = 'md', shape = 'rounded', className }: AvatarProps) {
  const initial = name.trim().charAt(0);
  return (
    <span
      className={cx(
        styles.avatar,
        size !== 'md' && styles[size],
        shape === 'circle' && styles.circle,
        className,
      )}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
