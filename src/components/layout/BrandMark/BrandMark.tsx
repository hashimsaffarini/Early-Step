import { Brain } from 'lucide-react';

import { APP_NAME } from '@/constants/app';

import styles from './BrandMark.module.css';

/** Product logo + name. The Latin name is isolated so it renders correctly in RTL text. */
export function BrandMark() {
  return (
    <span className={styles.brand}>
      <span className={styles.logo} aria-hidden="true">
        <Brain />
      </span>
      <span className={styles.name} lang="en" dir="ltr">
        {APP_NAME}
      </span>
    </span>
  );
}
