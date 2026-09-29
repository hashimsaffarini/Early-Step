import logo from '@/assets/images/logo.png';
import { APP_NAME } from '@/constants/app';
import { cx } from '@/utils/classNames';

import styles from './BrandMark.module.css';

const LOGO_SIZE_PX = 256;

export interface BrandMarkProps {
  size?: 'md' | 'lg';
  /** `onDark` for use on gradient/dark panels (logo sits on a white tile). */
  tone?: 'default' | 'onDark';
}

/**
 * Official Early Step logo + name. The logo is decorative here because the name
 * is always shown next to it; the Latin name is isolated for correct RTL rendering.
 */
export function BrandMark({ size = 'md', tone = 'default' }: BrandMarkProps) {
  return (
    <span
      className={cx(styles.brand, size === 'lg' && styles.lg, tone === 'onDark' && styles.onDark)}
    >
      <span className={styles.logo}>
        <img
          src={logo}
          alt=""
          width={LOGO_SIZE_PX}
          height={LOGO_SIZE_PX}
          className={styles.logoImage}
        />
      </span>
      <span className={styles.name} lang="en" dir="ltr">
        {APP_NAME}
      </span>
    </span>
  );
}
