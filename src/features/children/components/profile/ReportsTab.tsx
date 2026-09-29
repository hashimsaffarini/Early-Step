import { CalendarDays, FileText, UserRound } from 'lucide-react';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card } from '@/components/ui/Card';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildReport } from '@/features/children/types';

import styles from './profile.module.css';

/** Replit "التقارير" tab: report cards (no detail page yet). */
export function ReportsTab({ reports }: { reports: readonly ChildReport[] }) {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon={<FileText />}
        title="لا توجد تقارير بعد"
        description="ستظهر هنا التقارير التي يضيفها الأخصائي."
      />
    );
  }

  return (
    <ul className={`${styles.list} ${styles.twoColumns}`}>
      {reports.map((report) => (
        <Card as="li" key={report.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={`${styles.iconTile} ${styles.toneViolet}`} aria-hidden="true">
              <FileText />
            </span>
            <div className={styles.rowBody}>
              <h3 className={styles.rowTitle}>{report.title}</h3>
              <ul className={styles.meta}>
                <li>
                  <CalendarDays aria-hidden="true" />
                  <time dateTime={report.date}>{formatDisplayDate(report.date)}</time>
                </li>
                <li>
                  <UserRound aria-hidden="true" />
                  {report.authorName}
                </li>
              </ul>
            </div>
          </div>
          <p className={styles.muted}>{report.summary}</p>
          <div className={styles.footer}>
            <ComingSoonButton size="md">عرض التقرير</ComingSoonButton>
          </div>
        </Card>
      ))}
    </ul>
  );
}
