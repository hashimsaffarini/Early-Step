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
import { childFacts } from '@/features/children';
import { TeacherNotesSection } from '@/features/feedback';
import { ChildPlanPanel } from '@/features/training-plans';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildPlanActivities, useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './ChildDashboardPage.module.css';

/**
 * The teacher's view of one assigned child (client revisions 2026-10, like the specialist's but
 * read-only): header with the child's facts (`GET Teacher/children`) and plan progress, the plan's
 * stat cards, the «التقييم الأولي» card (its details page shows categories, question types and the
 * child's answers when the server allows the teacher to read them), the activities with their
 * saved results and the child's answers where allowed («ابدأ» to play in class), and the teacher's
 * notes for the specialist (add / edit / delete). No plan management and no reports.
 */
export function TeacherChildPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Teacher');
  const child = children.data?.find((item) => item.id === childId);
  const plan = useChildPlanActivities(child?.id);
  const assessment = useAssessmentStatus(child ? child.id : undefined);
  const isPlanOpen = assessment.state === 'complete' || assessment.state === 'unavailable';
  const summary = plan.data && isPlanOpen ? summarizePlan(plan.data) : null;

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
          eyebrow="الخطة التدريبية وملاحظات المعلم"
          facts={childFacts(child, { withParent: true })}
          progress={childHeroProgress(summary)}
        />
        {summary && summary.total > 0 ? <PlanStatGrid summary={summary} /> : null}
        <AssessmentStatusCard status={assessment} to={paths.childAssessment(child.id)} />
        <div className={styles.columns}>
          <div className={styles.main}>
            <AssessmentPlanGate status={assessment}>
              <ChildPlanPanel
                childId={child.id}
                showSummary={false}
                showAnswers
                playTo={(activity) => paths.planActivityPlay(child.id, activity.activityId)}
              />
            </AssessmentPlanGate>
          </div>
          <div className={styles.aside}>
            <TeacherNotesSection childId={child.id} />
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
