import type { ReactNode } from 'react';

import { PageHeader } from '@/components/shared/PageHeader';

import { ContentNav } from './ContentNav';
import styles from './content.module.css';

export interface ContentPageProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Common frame of the admin content pages: title, actions, sub-navigation. */
export function ContentPage({ title, subtitle, actions, children }: ContentPageProps) {
  return (
    <div className={styles.page}>
      <PageHeader title={title} {...(subtitle ? { subtitle } : {})} actions={actions} />
      <ContentNav />
      {children}
    </div>
  );
}
