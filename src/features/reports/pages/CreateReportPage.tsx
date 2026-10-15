import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, CircleAlert, CircleCheck, Send, UserRound, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
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

function SavedState({
  onWriteAnother,
  reportsPath,
}: {
  onWriteAnother: () => void;
  reportsPath: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Card className={styles.done}>
      <CircleCheck className={styles.doneIcon} aria-hidden="true" />
      <h2 ref={titleRef} tabIndex={-1} className={styles.doneTitle}>
        تم حفظ التقرير
      </h2>
      <p className={styles.doneText}>أصبح التقرير متاحاً لولي الأمر في ملف الطفل.</p>
      <div className={styles.doneActions}>
        <Link to={reportsPath} className={getButtonClassName()}>
          عرض جميع التقارير
        </Link>
        <Button variant="outline" onClick={onWriteAnother}>
          كتابة تقرير لطفل آخر
        </Button>
      </div>
    </Card>
  );
}

/**
 * Create report (`POST specialist/CreateReport`). Manual entry only — Replit's AI mode, the
 * probability slider, report types and "strengths" have no API field and are not migrated.
 * One initial-assessment report per child (business rule confirmed by the backend team): a child
 * who already has a report links to editing it instead of offering a second report.
 */
export function CreateReportPage() {
  const { role, paths } = useRoleArea();
  const session = useSession();
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
    reset,
    formState: { errors },
  } = useForm<CreateReportFormValues>({
    resolver: zodResolver(createReportSchema),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(values);
  });

  const writeAnother = () => {
    reset(EMPTY_VALUES);
    createMutation.reset();
  };

  const childError = errors.childId?.message;
  const children = childrenQuery.data ?? [];

  let body;
  if (createMutation.isSuccess) {
    body = <SavedState onWriteAnother={writeAnother} reportsPath={paths.reports} />;
  } else if (
    childrenQuery.isPending ||
    (existingReports.isSupported && existingReports.isPending)
  ) {
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
        <ApiErrorAlert error={createMutation.error} />
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
      <Link to={paths.reports} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى التقارير
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
