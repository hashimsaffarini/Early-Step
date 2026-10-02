import { FileText } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import type { RosterReport } from '@/features/dashboards/types';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './superAdmin.module.css';

export interface ReportsTabProps {
  reports: readonly RosterReport[];
}

/** All reports: title, child, author and date (no risk levels). */
export function ReportsTab({ reports }: ReportsTabProps) {
  if (reports.length === 0) {
    return <EmptyState icon={<FileText />} title="لا توجد تقارير" />;
  }
  return (
    <ul className={styles.list} aria-label="جميع التقارير">
      {reports.map((report) => (
        <li key={report.id} className={styles.reportRow}>
          <span className={styles.reportIcon} aria-hidden="true">
            <FileText />
          </span>
          <div className={styles.reportText}>
            <p className={styles.name}>{`${report.title} — ${report.childName}`}</p>
            <p className={styles.reportMeta}>{`بقلم: ${report.authorName}`}</p>
          </div>
          <time className={styles.reportDate} dateTime={report.date}>
            {formatDisplayDate(report.date)}
          </time>
        </li>
      ))}
    </ul>
  );
}
