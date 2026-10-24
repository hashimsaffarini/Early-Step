import { ArrowRight, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import {
  AssessmentPlanGate,
  AssessmentStatusCard,
  ChildHero,
  childHeroProgress,
  PlanStatGrid,
} from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { childFacts, TeacherFeedbackPanel } from '@/features/children';
import { ChildReportPanel } from '@/features/reports';
import { SpecialistPlanEditor, useSpecialistPlan } from '@/features/training-plans';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './ChildDashboardPage.module.css';

/**
 * The specialist's child dashboard (client revisions 2026-10, latest request wins): header with the
 * child's facts (`GET specialist/children`, the teacher from the plan) and the plan's server
 * progress, the plan's stat cards (`TrainingPlan/specialist/children/{id}`: results included), the
 * «التقييم الأولي» card that opens the dedicated assessment page, the plan (teacher, add / remove
 * activities and games, the child's answers) — only once the initial assessment is completed —
 * then the teacher's notes and the child's report (the specialist writes it).
 */
export function SpecialistChildPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Specialist');
  const child = children.data?.find((item) => item.id === childId);
  const plan = useSpecialistPlan(childId, Boolean(child));
  const assessment = useAssessmentStatus(child ? child.id : undefined);
  // The plan (and its figures) appears once the assessment is completed (or is not readable).
  const isPlanOpen = assessment.state === 'complete' || assessment.state === 'unavailable';
  const summary =
    plan.data && isPlanOpen ? summarizePlan(plan.data.activities, plan.data.progress) : null;

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
        <AssessmentStatusCard status={assessment} to={paths.childAssessment(child.id)} />
        <div className={styles.columns}>
          <div className={styles.main}>
            <AssessmentPlanGate status={assessment}>
              <SpecialistPlanEditor
                child={{ id: child.id, name: child.fullName, teacherName: child.teacherName }}
                showSummary={false}
              />
            </AssessmentPlanGate>
          </div>
          <div className={styles.aside}>
            <TeacherFeedbackPanel childId={child.id} />
            <ChildReportPanel childId={child.id} />
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
