import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { SectionHeader, type SectionHeaderProps } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';

import styles from './DashboardPanel.module.css';

export interface DashboardPanelProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconTone?: NonNullable<SectionHeaderProps['iconTone']>;
  action?: ReactNode;
  children: ReactNode;
}

/** One large, flat section of a child dashboard (same level as its siblings, no nested cards). */
export function DashboardPanel({
  id,
  title,
  icon,
  iconTone = 'primary',
  action,
  children,
}: DashboardPanelProps) {
  return (
    <Card as="section" className={styles.panel} aria-labelledby={id}>
      <SectionHeader id={id} title={title} icon={icon} iconTone={iconTone} action={action} />
      {children}
    </Card>
  );
}
