import { ArrowRight, UserX } from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Link, useParams } from 'react-router';

import {
  AssessmentPlanGate,
  ChildHero,
  childHeroProgress,
  PlanStatGrid,
} from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { AssessmentOverview, childFacts, TeacherFeedbackPanel } from '@/features/children';
import { ChildReportEditor } from '@/features/reports';
import { SpecialistPlanEditor, useSpecialistPlan } from '@/features/training-plans';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './ChildDashboardPage.module.css';

/**
 * Part 4 specialist child file: initial-assessment / plan tabs, server category results and an
 * inline report editor. Plan editing and teacher feedback remain in the plan tab. Tab content
 * stays mounted so a report draft survives switching tabs. Child-data editing is Parent-only.
 */
export function SpecialistChildPage() {
  const { childId = '' } = useParams();
  const [tab, setTab] = useState<'assessment' | 'plan'>('assessment');
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
        <Tabs
          className={styles.fileTabs}
          label="ملف الطفل"
          items={[
            { value: 'assessment', label: 'التقييم المبدئي' },
            { value: 'plan', label: 'الخطة التدريبية' },
          ]}
          value={tab}
          onChange={setTab}
        >
          <div className={styles.main} hidden={tab !== 'assessment'}>
            <AssessmentOverview status={assessment} detailsTo={paths.childAssessment(child.id)} />
            <ChildReportEditor childId={child.id} />
          </div>
          <div className={styles.main} hidden={tab !== 'plan'}>
            {summary && summary.total > 0 ? <PlanStatGrid summary={summary} compact /> : null}
            <AssessmentPlanGate status={assessment}>
              <SpecialistPlanEditor
                child={{ id: child.id, name: child.fullName, teacherName: child.teacherName }}
                showSummary={false}
              />
            </AssessmentPlanGate>
            <TeacherFeedbackPanel childId={child.id} />
          </div>
        </Tabs>
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
