import {
  ArrowRight,
  CalendarDays,
  Download,
  FileSearch,
  FileText,
  ListChecks,
  Pencil,
  Sprout,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { canCreateReports } from '@/constants/routes';
import { useRoleArea } from '@/hooks/useRoleArea';
import { formatDisplayDate } from '@/utils/dateFormat';

import {
  useDeleteReportMutation,
  useDownloadReportMutation,
  useRoleReports,
  type ReportView,
} from '../api/reportsQueries';
import { ReportsBlocked } from '../components/ReportsBlocked';
import { toLines } from '../lines';

import styles from './ReportDetailPage.module.css';

const BACK_LABEL = 'العودة إلى التقارير';

interface Fact {
  label: string;
  value: string;
  icon: LucideIcon;
}

function getFacts(report: ReportView): Fact[] {
  const facts: Fact[] = [];
  if (report.childName) facts.push({ label: 'الطفل', value: report.childName, icon: UserRound });
  if (report.createdAt) {
    facts.push({
      label: 'التاريخ',
      value: formatDisplayDate(report.createdAt),
      icon: CalendarDays,
    });
  }
  if (report.authorName) facts.push({ label: 'كتبه', value: report.authorName, icon: UserRound });
  return facts;
}

/**
 * Report detail. There is no GET-by-id endpoint, so the report is resolved from the role's
 * report list (NOT LIVE-VERIFIED). Only real API fields are shown; the PDF comes from the server.
 */
export function ReportDetailPage() {
  const { reportId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const navigate = useNavigate();
  const { isSupported, reports, isPending, error, refetch } = useRoleReports(role);
  const downloadMutation = useDownloadReportMutation();
  const deleteMutation = useDeleteReportMutation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const backLink = (
    <Link to={paths.reports} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      {BACK_LABEL}
    </Link>
  );

  if (!isSupported) {
    return (
      <div className={styles.page}>
        {backLink}
        <ReportsBlocked />
      </div>
    );
  }
  if (isPending) return <LoadingState label="جارٍ تحميل التقرير…" />;
  if (error) {
    return (
      <div className={styles.page}>
        {backLink}
        <ErrorState
          title="تعذّر تحميل التقرير"
          description={error.message}
          action={
            <Button variant="outline" onClick={refetch}>
              إعادة المحاولة
            </Button>
          }
        />
      </div>
    );
  }

  const report = reports.find((candidate) => candidate.id === reportId);
  if (!report) {
    return (
      <div className={styles.page}>
        {backLink}
        <EmptyState
          icon={<FileSearch />}
          title="لم يتم العثور على التقرير"
          description="قد يكون الرابط غير صحيح أو أن التقرير غير متاح لك."
          action={
            <Link to={paths.reports} className={getButtonClassName()}>
              {BACK_LABEL}
            </Link>
          }
        />
      </div>
    );
  }

  const canEdit = canCreateReports(role);
  const title = report.title || 'تقرير';
  const facts = getFacts(report);
  const weaknesses = toLines(report.weaknesses);
  const recommendations = toLines(report.recommendations);
  const subtitle = [report.childName, report.createdAt ? formatDisplayDate(report.createdAt) : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <article className={styles.page} aria-labelledby="report-title">
      {backLink}
      <header className={styles.header}>
        <div>
          <h1 id="report-title" className={styles.title}>
            {title}
          </h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className={styles.actions}>
          <Button
            variant="outline"
            iconStart={<Download aria-hidden="true" />}
            isLoading={downloadMutation.isPending}
            onClick={() => {
              downloadMutation.mutate(report.id);
            }}
          >
            تحميل PDF
          </Button>
          {canEdit ? (
            <>
              <Link
                to={paths.reportEdit(report.id)}
                className={getButtonClassName({ variant: 'soft' })}
              >
                <Pencil aria-hidden="true" />
                تعديل
              </Link>
              <Button
                variant="danger"
                iconStart={<Trash2 aria-hidden="true" />}
                onClick={() => {
                  setIsConfirmOpen(true);
                }}
              >
                حذف
              </Button>
            </>
          ) : null}
        </div>
      </header>

      <ApiErrorAlert
        error={downloadMutation.error}
        message={downloadMutation.error ? 'تعذّر تحميل ملف التقرير. حاول مرة أخرى.' : undefined}
      />

      {facts.length > 0 ? (
        <Card as="section" className={styles.summary} aria-labelledby="report-summary">
          <SectionHeader
            id="report-summary"
            title="ملخص التقرير"
            icon={FileText}
            iconTone="violet"
          />
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <span className={styles.factIcon} aria-hidden="true">
                  <fact.icon />
                </span>
                <div>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>
      ) : null}

      <Card as="section" className={styles.section} aria-labelledby="report-areas">
        <SectionHeader
          id="report-areas"
          title="جوانب تحتاج إلى دعم"
          icon={Sprout}
          iconTone="accent"
        />
        {weaknesses.length > 0 ? (
          <ul className={styles.bullets}>
            {weaknesses.map((item) => (
              <li key={item} className={styles.bullet}>
                <Sprout className={styles.warningIcon} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.summaryText}>لم تُكتب ملاحظات في هذا القسم.</p>
        )}
      </Card>

      <Card as="section" className={styles.section} aria-labelledby="report-recommendations">
        <SectionHeader
          id="report-recommendations"
          title="التوصيات"
          icon={ListChecks}
          iconTone="violet"
        />
        {recommendations.length > 0 ? (
          <ol className={styles.recommendations}>
            {recommendations.map((item) => (
              <li key={item} className={styles.recommendation}>
                {item}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.summaryText}>لم تُكتب توصيات في هذا التقرير.</p>
        )}
      </Card>

      <div className={styles.footer}>
        <Link to={paths.reports} className={getButtonClassName()}>
          {BACK_LABEL}
        </Link>
      </div>

      {canEdit ? (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          title="حذف التقرير"
          description={`سيتم حذف «${title}» نهائياً. لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="حذف"
          isConfirming={deleteMutation.isPending}
          onCancel={() => {
            setIsConfirmOpen(false);
          }}
          onConfirm={() => {
            deleteMutation.mutate(report.id, {
              onSuccess: () => {
                setIsConfirmOpen(false);
                void navigate(paths.reports, { replace: true });
              },
            });
          }}
        />
      ) : null}
      {deleteMutation.error ? <ApiErrorAlert error={deleteMutation.error} /> : null}
    </article>
  );
}
