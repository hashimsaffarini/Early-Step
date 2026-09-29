import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';
import { getButtonClassName } from '@/components/ui/Button';
import { ROUTE_PATHS } from '@/constants/routes';

import { LANDING_COPY } from '../content';

import styles from './LandingNavbar.module.css';

const HOME_LABEL = 'الصفحة الرئيسية';

export function LandingNavbar() {
  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <Link to={ROUTE_PATHS.home} className={styles.brandLink} aria-label={HOME_LABEL}>
          <BrandMark />
        </Link>
        <nav className={styles.actions} aria-label="روابط الحساب">
          <Link to={ROUTE_PATHS.login} className={styles.loginLink}>
            {LANDING_COPY.nav.login}
          </Link>
          <Link to={ROUTE_PATHS.register} className={getButtonClassName({ size: 'sm' })}>
            <Sparkles aria-hidden="true" />
            {LANDING_COPY.nav.start}
          </Link>
        </nav>
      </div>
    </header>
  );
}
