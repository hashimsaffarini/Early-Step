import { Eye, FileText } from 'lucide-react';
import { Link } from 'react-router';

import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useChildReport } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import { DashboardPanel } from './DashboardPanel';
import styles from './ChildReportSummary.module.css';

/**
 * The child's report, read-only (client revision 2026-11: the parent reads the specialist's report
 * again). Source: `GET Reports/child/{childId}` (verified for the Parent; 404 → no report yet).
 * «عرض التقرير» opens the report page, which also downloads the server PDF.
 */
export function ChildReportSummary({ childId }: { childId: string }) {
  const { paths } = useRoleArea();
  const report = useChildReport(childId);

  let body;
  if (report.isPending) {
    body = <LoadingState label="جارٍ تحميل التقرير…" />;
  } else if (report.isError) {
    body = (
      <ErrorState
        isBoxed={false}
        title="تعذّر تحميل التقرير"
        description={report.error.message}
        action={
          <Button variant="outline" size="sm" onClick={() => void report.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (!report.data) {
    body = <p className={styles.muted}>لم يكتب الأخصائي تقريراً لهذا الطفل بعد.</p>;
  } else {
    const { id, title, createdAt, authorName } = report.data;
    const meta = [
      authorName ? `بقلم: ${authorName}` : null,
      createdAt ? formatDisplayDate(createdAt) : null,
    ].filter(Boolean);
    body = (
      <div className={styles.summary}>
        <p className={styles.title}>{title || 'تقرير بلا عنوان'}</p>
        {meta.length > 0 ? <p className={styles.muted}>{meta.join(' · ')}</p> : null}
        <Link to={paths.reportDetail(id)} className={getButtonClassName({ variant: 'soft' })}>
          <Eye aria-hidden="true" />
          عرض التقرير
        </Link>
      </div>
    );
  }

  return (
    <DashboardPanel id="child-report-title" title="تقرير الأخصائي" icon={FileText} iconTone="success">
      {body}
    </DashboardPanel>
  );
}
