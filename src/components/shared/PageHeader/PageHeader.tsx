import type { ReactNode } from 'react';

import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  headingLevel?: 1 | 2;
  subtitle?: string;
  actions?: ReactNode;
}

/** Plain page title row: heading + subtitle at inline-start, actions at inline-end. */
export function PageHeader({ title, subtitle, actions, headingLevel = 1 }: PageHeaderProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  return (
    <header className={styles.header}>
      <div>
        <Heading className={styles.title}>{title}</Heading>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
