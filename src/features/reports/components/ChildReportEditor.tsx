import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { useChildReport } from '@/hooks/api/childResources';
import type { ChildReport } from '@/services/api/childReports';
import { formatDisplayDate } from '@/utils/dateFormat';

import { useCreateReportMutation, useUpdateReportMutation } from '../api/reportsQueries';
import { reportFieldsSchema, type ReportFieldsValues } from '../schemas/createReport';
import styles from './ChildReportEditor.module.css';

function ReportForm({ childId, report }: { childId: string; report: ChildReport | null }) {
  const create = useCreateReportMutation();
  const update = useUpdateReportMutation(report?.id ?? '');
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ReportFieldsValues>({
    resolver: zodResolver(reportFieldsSchema),
    defaultValues: {
      title: report?.title ?? '',
      weaknesses: report?.weaknesses ?? '',
      recommendations: report?.recommendations ?? '',
    },
  });
  const pending = create.isPending || update.isPending;
  const submit = handleSubmit(async (values) => {
    try {
      if (report) await update.mutateAsync(values);
      else await create.mutateAsync({ ...values, childId });
      reset(values);
      toast.success('تم حفظ التقرير بنجاح');
    } catch {
      /* The normalized error is shown below; keep the draft for retry. */
    }
  });
  return (
    <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
      <ApiErrorAlert error={create.error ?? update.error} />
      <FormField label="عنوان التقرير" error={errors.title?.message} isRequired>
        {(field) => <Input {...field} {...register('title')} disabled={pending} />}
      </FormField>
      <div className={styles.fields}>
        <FormField label="جوانب تحتاج إلى دعم" error={errors.weaknesses?.message} isRequired>
          {(field) => (
            <Textarea
              {...field}
              {...register('weaknesses')}
              rows={4}
              placeholder="اكتب ملاحظاتك حول نتيجة التقييم…"
              disabled={pending}
            />
          )}
        </FormField>
        <FormField label="التوصيات" error={errors.recommendations?.message} isRequired>
          {(field) => (
            <Textarea
              {...field}
              {...register('recommendations')}
              rows={4}
              placeholder="اكتب توصياتك للأسرة والمعلم…"
              disabled={pending}
            />
          )}
        </FormField>
      </div>
      <div className={styles.footer}>
        {report?.createdAt ? (
          <p
            className={styles.meta}
          >{`تاريخ إنشاء التقرير: ${formatDisplayDate(report.createdAt)}`}</p>
        ) : null}
        <Button
          type="submit"
          iconStart={<Save aria-hidden="true" />}
          isLoading={pending}
          disabled={!isDirty}
        >
          حفظ التقرير
        </Button>
      </div>
    </form>
  );
}

/** The specialist writes or edits the child's one real report directly below the assessment. */
export function ChildReportEditor({ childId }: { childId: string }) {
  const query = useChildReport(childId);
  return (
    <DashboardPanel
      id="child-report-editor"
      title="تقرير الأخصائي"
      icon={FileText}
      iconTone="violet"
    >
      {query.isPending ? <LoadingState label="جارٍ تحميل التقرير…" /> : null}
      <ApiErrorAlert error={query.error} onRetry={() => void query.refetch()} />
      {query.isSuccess ? (
        <ReportForm key={query.data?.id ?? 'new'} childId={childId} report={query.data} />
      ) : null}
    </DashboardPanel>
  );
}
