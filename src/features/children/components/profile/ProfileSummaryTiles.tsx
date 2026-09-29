import { CircleCheck, ClipboardCheck, FileText, ListChecks, type LucideIcon } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import type { ChildProfileDetails } from '@/features/children/types';

import { countCompleted } from './labels';
import styles from './profile.module.css';

const HEADING_ID = 'profile-summary-title';

interface Tile {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string | undefined;
}

/** Replit "ملخص الأنشطة" pastel tiles — plain counts only. */
export function ProfileSummaryTiles({ details }: { details: ChildProfileDetails }) {
  const planActivities = details.plan?.activities ?? [];
  const tiles: Tile[] = [
    {
      label: 'أنشطة الخطة',
      value: planActivities.length,
      icon: ListChecks,
      tone: styles.toneViolet,
    },
    {
      label: 'أنشطة منجزة',
      value: countCompleted(planActivities),
      icon: CircleCheck,
      tone: styles.toneSuccess,
    },
    {
      label: 'تقييمات مكتملة',
      value: details.assessments.filter((assessment) => assessment.state === 'completed').length,
      icon: ClipboardCheck,
      tone: styles.tonePrimary,
    },
    { label: 'التقارير', value: details.reports.length, icon: FileText, tone: styles.toneWarning },
  ];

  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="ملخص الأنشطة" icon={ListChecks} iconTone="violet" />
      <ul className={styles.tiles}>
        {tiles.map((tile) => (
          <li key={tile.label} className={cx(styles.tile, tile.tone)}>
            <tile.icon aria-hidden="true" />
            <div>
              <p className={styles.tileValue}>{tile.value}</p>
              <p className={styles.tileLabel}>{tile.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
