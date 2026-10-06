import { CalendarDays, ChevronLeft, FileText, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildReports } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import { firstLine } from './labels';
import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

/** Child reports (`GET Reports/child/{childId}`), linking to the report detail. */
export function ReportsTab({ childId }: { childId: string }) {
  const { paths } = useRoleArea();
  const query = useChildReports(childId);
  if (query.isPending || query.isError) {
    return <QueryStatus query={query} errorTitle="تعذّر تحميل التقارير" />;
  }
  if (query.data.length === 0) {
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
      {query.data.map((report) => (
        <Card as="li" key={report.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={`${styles.iconTile} ${styles.toneViolet}`} aria-hidden="true">
              <FileText />
            </span>
            <div className={styles.rowBody}>
              <h3 className={styles.rowTitle}>{report.title || 'تقرير'}</h3>
              <ul className={styles.meta}>
                {report.createdAt ? (
                  <li>
                    <CalendarDays aria-hidden="true" />
                    <time dateTime={report.createdAt}>{formatDisplayDate(report.createdAt)}</time>
                  </li>
                ) : null}
                {report.authorName ? (
                  <li>
                    <UserRound aria-hidden="true" />
                    {report.authorName}
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          {report.recommendations ? (
            <p className={styles.muted}>{firstLine(report.recommendations)}</p>
          ) : null}
          <div className={styles.footer}>
            <Link
              to={paths.reportDetail(report.id)}
              className={getButtonClassName({ variant: 'soft' })}
              aria-label={`عرض التقرير: ${report.title || 'تقرير'}`}
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
