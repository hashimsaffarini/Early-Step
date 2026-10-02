import { FileText } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import type { ChildReport } from '@/features/children/types';

import styles from './profile.module.css';

const HEADING_ID = 'profile-reports-summary-title';
const PREVIEW_COUNT = 2;

export interface ReportsSummaryCardProps {
  reports: readonly ChildReport[];
  onShowReports: () => void;
}

export function ReportsSummaryCard({ reports, onShowReports }: ReportsSummaryCardProps) {
  const { paths } = useRoleArea();
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="أحدث التقارير" icon={FileText} iconTone="violet" />
      {reports.length > 0 ? (
        <>
          <ul className={styles.list}>
            {reports.slice(0, PREVIEW_COUNT).map((report) => (
              <li key={report.id} className={styles.row}>
                <span className={`${styles.iconTile} ${styles.toneViolet}`} aria-hidden="true">
                  <FileText />
                </span>
                <div className={styles.rowBody}>
                  <Link to={paths.reportDetail(report.id)} className={styles.rowLink}>
                    {report.title}
                  </Link>
                  <time className={styles.muted} dateTime={report.date}>
                    {formatDisplayDate(report.date)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.footer}>
            <Button variant="soft" onClick={onShowReports}>
              عرض كل التقارير
            </Button>
          </div>
        </>
      ) : (
        <EmptyState
          isBoxed={false}
          icon={<FileText />}
          title="لا توجد تقارير بعد"
          description="ستظهر هنا التقارير التي يضيفها الأخصائي."
        />
      )}
    </Card>
  );
}
