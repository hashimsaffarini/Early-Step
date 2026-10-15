import { isMockMode } from '@/config/env';

import styles from './MockModeBanner.module.css';

/** Always visible in development mock mode so mock data is never mistaken for live data. */
export function MockModeBanner() {
  if (!isMockMode()) return null;
  return (
    <p className={styles.banner} role="note">
      وضع المحاكاة (للتطوير فقط): البيانات المعروضة تجريبية ولا يتم الاتصال بالخادم الحقيقي.
    </p>
  );
}
