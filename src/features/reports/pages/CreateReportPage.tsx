import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, CircleAlert, Send, UserRound, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { useToast } from '@/components/ui/Toast';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { HTTP_STATUS } from '@/services/http/httpStatus';
import { useSession } from '@/services/session';

import { useCreateReportMutation, useRoleReports } from '../api/reportsQueries';
import { ReportFields } from '../components/ReportFields';
import { createReportSchema, type CreateReportFormValues } from '../schemas/createReport';

import styles from './CreateReportPage.module.css';

const EMPTY_VALUES: CreateReportFormValues = {
  childId: '',
  title: '',
  weaknesses: '',
  recommendations: '',
};

/** Live (2026-10-14): a second report for the same child → 409. */
export const REPORT_EXISTS_MESSAGE = 'يوجد تقرير مسجل لهذا الطفل بالفعل.';

/**
 * Create report (`POST specialist/CreateReport`). Manual entry only — Replit's AI mode, the
 * probability slider, report types and "strengths" have no API field and are not migrated.
 * One initial-assessment report per child (business rule confirmed by the backend team): a child
 * who already has a report links to editing it instead of offering a second report.
 * Opened from a child page (`?childId=`) the child is preselected and the specialist returns
 * there after saving; success is a temporary toast (client revision 2026-10).
 */
export function CreateReportPage() {
  const { role, paths } = useRoleArea();
  const session = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromChildId = searchParams.get('childId') ?? '';
  const childrenQuery = useChildrenForRole(role);
  const createMutation = useCreateReportMutation();
  const existingReports = useRoleReports(role);
  const reportIdByChild = new Map(
    existingReports.reports.flatMap((report) =>
      report.childId ? [[report.childId, report.id] as const] : [],
    ),
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateReportFormValues>({
    resolver: zodResolver(createReportSchema),
    defaultValues: { ...EMPTY_VALUES, childId: fromChildId },
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        toast.success('تم حفظ التقرير بنجاح');
        void navigate(fromChildId ? paths.childProfile(values.childId) : paths.reports);
      },
    });
  });

  const childError = errors.childId?.message;
  const allChildren = childrenQuery.data ?? [];
  const fromChild = allChildren.find((child) => child.id === fromChildId);
  // From a child page only that child is offered.
  const children = fromChild ? [fromChild] : allChildren;
  const backTo = fromChild ? paths.childProfile(fromChild.id) : paths.reports;
  const isDuplicate = createMutation.error?.status === HTTP_STATUS.CONFLICT;

  let body;
  if (childrenQuery.isPending || (existingReports.isSupported && existingReports.isPending)) {
    // The existing reports decide which children may get a new one: wait for them too.
    body = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (existingReports.isSupported && existingReports.error) {
    body = (
      <ErrorState
        title="تعذّر تحميل التقارير الحالية"
        description={existingReports.error.message}
        action={
          <Button variant="outline" onClick={existingReports.refetch}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (childrenQuery.error) {
    body = (
      <ErrorState
        title="تعذّر تحميل الأطفال"
        description={childrenQuery.error.message}
        action={
          <Button
            variant="outline"
            onClick={() => {
              void childrenQuery.refetch();
            }}
          >
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (children.length === 0) {
    body = (
      <EmptyState
        icon={<Users />}
        title="لا يوجد أطفال مُسنَدون إليك"
        description="يمكنك كتابة تقرير بعد أن يُسنَد إليك طفل."
      />
    );
  } else {
    body = (
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        {isDuplicate ? (
          <Alert tone="danger">{REPORT_EXISTS_MESSAGE}</Alert>
        ) : (
          <ApiErrorAlert error={createMutation.error} />
        )}
        <Card className={styles.card}>
          <fieldset
            className={styles.fieldset}
            aria-describedby={childError ? 'report-child-error' : undefined}
          >
            <legend className={styles.legend}>
              <UserRound aria-hidden="true" />
              اختر الطفل
            </legend>
            <div className={styles.children}>
              {children.map((child) => {
                const reportId = reportIdByChild.get(child.id);
                if (reportId) {
                  return (
                    <div key={child.id} className={styles.childOption}>
                      <Avatar name={child.fullName} shape="circle" />
                      {child.fullName}
                      <Link
                        to={paths.reportEdit(reportId)}
                        aria-label={`تعديل تقرير ${child.fullName}`}
                      >
                        لديه تقرير — تعديله
                      </Link>
                    </div>
                  );
                }
                return (
                  <label key={child.id} className={styles.childOption}>
                    <input
                      type="radio"
                      value={child.id}
                      className={styles.radio}
                      {...register('childId')}
                    />
                    <Avatar name={child.fullName} shape="circle" />
                    {child.fullName}
                    <Check className={styles.check} aria-hidden="true" />
                  </label>
                );
              })}
            </div>
            {childError ? (
              <p id="report-child-error" className={styles.error}>
                <CircleAlert aria-hidden="true" />
                {childError}
              </p>
            ) : null}
          </fieldset>
        </Card>

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
          isLoading={createMutation.isPending}
          iconStart={<Send aria-hidden="true" />}
        >
          حفظ التقرير
        </Button>
      </form>
    );
  }

  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        {fromChild ? `العودة إلى ملف ${fromChild.fullName}` : 'العودة إلى التقارير'}
      </Link>
      {session?.user.name ? (
        <PageHeader title="إنشاء تقرير جديد" subtitle={`بقلم: ${session.user.name}`} />
      ) : (
        <PageHeader title="إنشاء تقرير جديد" />
      )}
      {body}
    </div>
  );
}
