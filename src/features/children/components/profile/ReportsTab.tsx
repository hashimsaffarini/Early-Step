import { CalendarDays, ChevronLeft, FileText, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildReport } from '@/features/children/types';

import styles from './profile.module.css';

/** Replit "التقارير" tab: report cards linking to the report detail. */
export function ReportsTab({ reports }: { reports: readonly ChildReport[] }) {
  const { paths } = useRoleArea();
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
            <Link
              to={paths.reportDetail(report.id)}
              className={getButtonClassName({ variant: 'soft' })}
              aria-label={`عرض التقرير: ${report.title}`}
            >
              عرض التقرير
              <ChevronLeft aria-hidden="true" />
            </Link>
          </div>
        </Card>
      ))}
    </ul>
  );
}
