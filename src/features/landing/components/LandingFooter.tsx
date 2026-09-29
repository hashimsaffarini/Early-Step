import { BrandMark } from '@/components/layout/BrandMark';
import { APP_NAME } from '@/constants/app';

import { LANDING_COPY } from '../content';

import styles from './LandingFooter.module.css';

export function LandingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <BrandMark size="lg" />
      </div>
      <p className={styles.description}>{LANDING_COPY.footer.description}</p>
      <p className={styles.copyright}>
        <bdi dir="ltr" lang="en">
          © {year} {APP_NAME}
        </bdi>
        . {LANDING_COPY.footer.rights}
      </p>
    </footer>
  );
}
