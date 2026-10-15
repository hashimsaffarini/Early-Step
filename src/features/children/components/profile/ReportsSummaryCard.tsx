import { FileText } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildReport } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './profile.module.css';
import { QueryStatus } from './TabStatus';

const HEADING_ID = 'profile-reports-summary-title';

export interface ReportsSummaryCardProps {
  childId: string;
  onShowReports: () => void;
}

export function ReportsSummaryCard({ childId, onShowReports }: ReportsSummaryCardProps) {
  const { paths } = useRoleArea();
  const query = useChildReport(childId);
  let body;
  if (query.isPending || query.isError) {
    body = <QueryStatus query={query} errorTitle="تعذّر تحميل التقرير" />;
  } else if (!query.data) {
    body = (
      <EmptyState
        isBoxed={false}
        icon={<FileText />}
        title="لا يوجد تقرير بعد"
        description="سيظهر هنا تقرير التقييم المبدئي الذي يكتبه الأخصائي."
      />
    );
  } else {
    body = (
      <>
        <ul className={styles.list}>
          {[query.data].map((report) => (
            <li key={report.id} className={styles.row}>
              <span className={`${styles.iconTile} ${styles.toneViolet}`} aria-hidden="true">
                <FileText />
              </span>
              <div className={styles.rowBody}>
                <Link to={paths.reportDetail(report.id)} className={styles.rowLink}>
                  {report.title || 'تقرير'}
                </Link>
                {report.createdAt ? (
                  <time className={styles.muted} dateTime={report.createdAt}>
                    {formatDisplayDate(report.createdAt)}
                  </time>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <Button variant="soft" onClick={onShowReports}>
            عرض التقرير
          </Button>
        </div>
      </>
    );
  }

  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="التقرير" icon={FileText} iconTone="violet" />
      {body}
    </Card>
  );
}
