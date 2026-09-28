import { Outlet } from 'react-router';

import { BrandMark } from '@/components/layout/BrandMark';

import styles from './AuthLayout.module.css';

/** Centred card on the warm canvas for login / register / password screens. */
export function AuthLayout() {
  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <div className={styles.brand}>
          <BrandMark />
        </div>
        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
