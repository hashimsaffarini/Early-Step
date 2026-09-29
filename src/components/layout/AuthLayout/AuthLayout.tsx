import { Outlet } from 'react-router';

import styles from './AuthLayout.module.css';

/** Warm canvas for centred auth cards (login / register). Pages render their own card. */
export function AuthLayout() {
  return (
    <main className={styles.page}>
      <Outlet />
    </main>
  );
}
