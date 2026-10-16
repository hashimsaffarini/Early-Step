import { ArrowRight, BookOpen, Plus, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { PlanActivity } from '@/services/api/childPlan';
import type { AppError } from '@/services/http/apiError';

import { useRemoveActivityMutation, useSpecialistPlan } from '../api/trainingPlansQueries';
import { AssignActivityDialog } from '../components/AssignActivityDialog';
import { AssignTeacherCard } from '../components/AssignTeacherCard';
import { ChildPlanPanel } from '../components/ChildPlanPanel';
import { PlanSection } from '../components/PlanSection';

import styles from './ChildPlansPage.module.css';

interface PlanChild {
  id: string;
  name: string;
}

function LoadError({
  error,
  onRetry,
  title = 'تعذّر تحميل الخطة التدريبية',
}: {
  error: AppError;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <ErrorState
      title={title}
      description={error.message}
      action={
        <Button variant="outline" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      }
    />
  );
}

/** Specialist: manage the plan (add from available activities, remove with confirmation). */
function SpecialistPlanEditor({ child }: { child: PlanChild }) {
  const plan = useSpecialistPlan(child.id, true);
  const removeMutation = useRemoveActivityMutation(child.id);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [toRemove, setToRemove] = useState<PlanActivity | null>(null);

  if (plan.isPending) return <LoadingState label="جارٍ تحميل الخطة…" />;
  if (plan.error) {
    return (
      <LoadError
        error={plan.error}
        onRetry={() => {
          void plan.refetch();
        }}
      />
    );
  }

  const addButton = (
    <Button
      iconStart={<Plus aria-hidden="true" />}
      onClick={() => {
        setIsPickerOpen(true);
      }}
    >
      إضافة نشاط
    </Button>
  );

  return (
    <>
      <AssignTeacherCard
        childId={child.id}
        childName={child.name}
        currentTeacherName={plan.data.teacherName}
      />
      <ApiErrorAlert error={removeMutation.error} />
      <PlanSection
        activities={plan.data.activities}
        action={addButton}
        emptyText={
          plan.data.hasPlan
            ? 'أضف أنشطة مناسبة للطفل من قائمة الأنشطة المتاحة.'
            : 'لا توجد خطة تدريبية لهذا الطفل بعد. أسنِد له معلماً، ثم أضف أول نشاط لبدء الخطة.'
        }
        onRemove={setToRemove}
        progress={plan.data.progress}
        resultChildId={child.id}
      />
      <AssignActivityDialog
        isOpen={isPickerOpen}
        childId={child.id}
        childName={child.name}
        onClose={() => {
          setIsPickerOpen(false);
        }}
      />
      <ConfirmDialog
        isOpen={toRemove !== null}
        title="إزالة النشاط من الخطة"
        description={`سيتم إزالة «${toRemove?.title ?? ''}» من خطة ${child.name}.`}
        confirmLabel="إزالة"
        isConfirming={removeMutation.isPending}
        onCancel={() => {
          setToRemove(null);
        }}
        onConfirm={() => {
          if (!toRemove) return;
          removeMutation.mutate(toRemove.activityId, {
            onSettled: () => {
              setToRemove(null);
            },
          });
        }}
      />
    </>
  );
}

/**
 * Training plan for one child. The real model is a list of assigned activities (Replit's
 * free-text IEP — goals, strategies, notes — has no API and is not migrated).
 */
export function ChildPlansPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const childrenQuery = useChildrenForRole(role);

  const notFound = (
    <div className={styles.page}>
      <Link to={paths.children} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى الأطفال
      </Link>
      <EmptyState
        icon={<UserX />}
        title="لم يتم العثور على الطفل"
        description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
        action={
          <Link to={paths.children} className={getButtonClassName()}>
            العودة إلى الأطفال
          </Link>
        }
      />
    </div>
  );

  if (role === 'Admin') {
    return (
      <div className={styles.page}>
        <Link to={paths.children} className={styles.backLink}>
          <ArrowRight aria-hidden="true" />
          العودة إلى الأطفال
        </Link>
        <EmptyState
          icon={<BookOpen />}
          title="الخطط التدريبية غير متاحة لحساب المدير بعد"
          description="لا يوفّر الخادم حالياً طريقة لعرض الخطط التدريبية للمدير."
        />
      </div>
    );
  }
  if (childrenQuery.isPending) return <LoadingState />;
  if (childrenQuery.error) {
    return (
      <div className={styles.page}>
        <LoadError
          error={childrenQuery.error}
          title="تعذّر تحميل قائمة الأطفال"
          onRetry={() => {
            void childrenQuery.refetch();
          }}
        />
      </div>
    );
  }

  const found = childrenQuery.data.find((candidate) => candidate.id === childId);
  if (!found) return notFound;
  const child: PlanChild = { id: found.id, name: found.fullName };

  return (
    <div className={styles.page}>
      <Link to={paths.childProfile(child.id)} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى ملف {child.name}
      </Link>

      <PageBanner
        tone="violet"
        title="الخطة التدريبية"
        subtitle={`للطفل: ${child.name}`}
        aside={
          <span className={styles.bannerIcon} aria-hidden="true">
            <BookOpen />
          </span>
        }
      />

      {role === 'Specialist' ? (
        <SpecialistPlanEditor child={child} />
      ) : (
        <ChildPlanPanel childId={child.id} />
      )}
    </div>
  );
}
