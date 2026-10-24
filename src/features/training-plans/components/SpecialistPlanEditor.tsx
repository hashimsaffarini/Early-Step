import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { PlanActivity } from '@/services/api/childPlan';

import { useRemoveActivityMutation, useSpecialistPlan } from '../api/trainingPlansQueries';

import { AssignActivityDialog } from './AssignActivityDialog';
import { AssignTeacherCard } from './AssignTeacherCard';
import { PlanSection } from './PlanSection';

export interface PlanChild {
  id: string;
  name: string;
  /** The teacher from the specialist's children list (used when the plan does not exist yet). */
  teacherName?: string | null;
}

/** Specialist: manage the plan (add from available activities, remove with confirmation). */
export function SpecialistPlanEditor({
  child,
  showSummary = true,
}: {
  child: PlanChild;
  /** False on the child dashboard, where the header and stat cards show the summary. */
  showSummary?: boolean;
}) {
  const plan = useSpecialistPlan(child.id, true);
  const removeMutation = useRemoveActivityMutation(child.id);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [toRemove, setToRemove] = useState<PlanActivity | null>(null);

  if (plan.isPending) return <LoadingState label="جارٍ تحميل الخطة…" />;
  if (plan.error) {
    return (
      <ErrorState
        title="تعذّر تحميل الخطة التدريبية"
        description={plan.error.message}
        action={
          <Button variant="outline" onClick={() => void plan.refetch()}>
            إعادة المحاولة
          </Button>
        }
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
        currentTeacherName={plan.data.teacherName ?? child.teacherName ?? null}
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
        showSummary={showSummary}
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
