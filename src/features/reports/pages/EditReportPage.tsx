import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, FileSearch, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useRoleArea } from '@/hooks/useRoleArea';

import { useRoleReports, useUpdateReportMutation, type ReportView } from '../api/reportsQueries';
import { ReportFields } from '../components/ReportFields';
import { reportFieldsSchema, type ReportFieldsValues } from '../schemas/createReport';

import styles from './CreateReportPage.module.css';

function EditReportForm({ report }: { report: ReportView }) {
  const { paths } = useRoleArea();
  const navigate = useNavigate();
  const toast = useToast();
  const updateMutation = useUpdateReportMutation(report.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReportFieldsValues>({
    resolver: zodResolver(reportFieldsSchema),
    defaultValues: {
      title: report.title,
      weaknesses: report.weaknesses,
      recommendations: report.recommendations,
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        toast.success('تم تحديث التقرير بنجاح');
        void navigate(paths.reportDetail(report.id));
      },
    });
  });

  return (
    <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
      <ApiErrorAlert error={updateMutation.error} />
      <ReportFields
        fields={{
          title: register('title'),
          weaknesses: register('weaknesses'),
          recommendations: register('recommendations'),
        }}
        errors={{
          title: errors.title?.message,
          weaknesses: errors.weaknesses?.message,
          recommendations: errors.recommendations?.message,
        }}
      />
      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={updateMutation.isPending}
        iconStart={<Save aria-hidden="true" />}
      >
        حفظ التعديلات
      </Button>
    </form>
  );
}

/** Edit report (`PUT specialist/{reportId}`); the report is resolved from the specialist list. */
export function EditReportPage() {
  const { reportId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const { reports, isPending, error, refetch } = useRoleReports(role);
  const report = reports.find((candidate) => candidate.id === reportId);

  let body;
  if (isPending) {
    body = <LoadingState label="جارٍ تحميل التقرير…" />;
  } else if (error) {
    body = (
      <ErrorState
        title="تعذّر تحميل التقرير"
        description={error.message}
        action={
          <Button variant="outline" onClick={refetch}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (!report) {
    body = (
      <EmptyState
        icon={<FileSearch />}
        title="لم يتم العثور على التقرير"
        description="قد يكون الرابط غير صحيح أو أن التقرير غير متاح لك."
        action={
          <Link to={paths.reports} className={getButtonClassName()}>
            العودة إلى التقارير
          </Link>
        }
      />
    );
  } else {
    body = <EditReportForm report={report} />;
  }

  return (
    <div className={styles.page}>
      <Link to={report ? paths.reportDetail(report.id) : paths.reports} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        {report ? 'العودة إلى التقرير' : 'العودة إلى التقارير'}
      </Link>
      {report?.childName ? (
        <PageHeader title="تعديل التقرير" subtitle={`للطفل: ${report.childName}`} />
      ) : (
        <PageHeader title="تعديل التقرير" />
      )}
      {body}
    </div>
  );
}
