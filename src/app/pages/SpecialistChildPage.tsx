import { ArrowRight, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { ChildHero, childHeroProgress, PlanStatGrid } from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { AssessmentResultPanel, childFacts, TeacherFeedbackPanel } from '@/features/children';
import { SpecialistPlanEditor, useSpecialistPlan } from '@/features/training-plans';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './ChildDashboardPage.module.css';

/**
 * The specialist's child dashboard (client revision 2026-10): header with the child's facts
 * (`GET specialist/children`, the teacher from the plan) and the plan's server progress, the
 * plan's stat cards (`TrainingPlan/specialist/children/{id}`: results included), then the plan
 * management (teacher, add / remove activities, the child's answers) next to the initial
 * assessment result and the teacher's notes. No reports (client request).
 */
export function SpecialistChildPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Specialist');
  const child = children.data?.find((item) => item.id === childId);
  const plan = useSpecialistPlan(childId, Boolean(child));
  const summary = plan.data ? summarizePlan(plan.data.activities, plan.data.progress) : null;

  let body;
  if (children.isPending) {
    body = <LoadingState />;
  } else if (children.error) {
    body = (
      <ErrorState
        title="تعذّر تحميل بيانات الطفل"
        description={children.error.message}
        action={
          <Button variant="outline" onClick={() => void children.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (!child) {
    body = (
      <EmptyState
        icon={<UserX />}
        title="لم يتم العثور على الطفل"
        description="قد يكون الرابط غير صحيح أو أن الطفل غير مُسنَد إليك."
        action={
          <Link to={paths.children} className={getButtonClassName()}>
            العودة إلى الأطفال
          </Link>
        }
      />
    );
  } else {
    body = (
      <>
        <ChildHero
          name={child.fullName}
          eyebrow="متابعة الطفل والخطة التدريبية"
          facts={childFacts(child, {
            withParent: true,
            teacherName: plan.data?.teacherName ?? null,
          })}
          progress={childHeroProgress(summary)}
        />
        {summary && summary.total > 0 ? <PlanStatGrid summary={summary} /> : null}
        <div className={styles.columns}>
          <div className={styles.main}>
            <SpecialistPlanEditor
              child={{ id: child.id, name: child.fullName }}
              showSummary={false}
            />
          </div>
          <div className={styles.aside}>
            <AssessmentResultPanel childId={child.id} />
            <TeacherFeedbackPanel childId={child.id} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={styles.page}>
      <Link to={paths.children} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى الأطفال
      </Link>
      {body}
    </div>
  );
}
