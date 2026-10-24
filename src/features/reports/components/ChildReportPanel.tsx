import { Eye, FilePlus2, FileText, Pencil } from 'lucide-react';
import { Link } from 'react-router';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useChildReport } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import styles from './ChildReportPanel.module.css';

export interface ChildReportPanelProps {
  childId: string;
}

/**
 * «التقارير» on the specialist's child page (latest client request 2026-10: the specialist writes
 * the child's report — overrides the earlier removal). One report per child (live: a second one →
 * 409): «إضافة تقرير» while there is none, otherwise its summary with «عرض التقرير» and
 * «تعديل التقرير» (`PUT specialist/{id}` is supported). Source: `GET Reports/child/{childId}`.
 */
export function ChildReportPanel({ childId }: ChildReportPanelProps) {
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
    body = (
      <div className={styles.empty}>
        <p className={styles.muted}>لا يوجد تقرير لهذا الطفل بعد.</p>
        <Link
          to={`${paths.reportCreate}?childId=${encodeURIComponent(childId)}`}
          className={getButtonClassName()}
        >
          <FilePlus2 aria-hidden="true" />
          إضافة تقرير
        </Link>
      </div>
    );
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
        <div className={styles.actions}>
          <Link to={paths.reportDetail(id)} className={getButtonClassName({ variant: 'soft' })}>
            <Eye aria-hidden="true" />
            عرض التقرير
          </Link>
          <Link to={paths.reportEdit(id)} className={getButtonClassName({ variant: 'outline' })}>
            <Pencil aria-hidden="true" />
            تعديل التقرير
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardPanel id="child-report-title" title="التقرير" icon={FileText} iconTone="success">
      {body}
    </DashboardPanel>
  );
}
