import { ClipboardList, Gamepad2, ListChecks, type LucideIcon } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { useChildPlanSummary } from '@/hooks/api/childResources';
import { cx } from '@/utils/classNames';

import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

const HEADING_ID = 'profile-summary-title';

interface Tile {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string | undefined;
}

/** Replit "ملخص الأنشطة" pastel tiles — server counts only (plan summary). */
export function ProfileSummaryTiles({ childId }: { childId: string }) {
  const summary = useChildPlanSummary(childId);

  let body;
  if (summary.isPending || summary.isError) {
    body = <QueryStatus query={summary} errorTitle="تعذّر تحميل ملخص الخطة" />;
  } else {
    const tiles: Tile[] = [
      {
        label: 'أنشطة الخطة',
        value: summary.data.totalCount,
        icon: ListChecks,
        tone: styles.toneViolet,
      },
      {
        label: 'الاختبارات',
        value: summary.data.testsCount,
        icon: ClipboardList,
        tone: styles.tonePrimary,
      },
      {
        label: 'الألعاب',
        value: summary.data.gamesCount,
        icon: Gamepad2,
        tone: styles.toneSuccess,
      },
    ];
    body = (
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
    );
  }
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="ملخص الأنشطة" icon={ListChecks} iconTone="violet" />
      {body}
    </Card>
  );
}
