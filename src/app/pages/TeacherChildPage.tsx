import { useState } from 'react';
import { Select, FormField } from '@/components/ui/Field';
import { ArrowRight, Eye, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import {
  AssessmentPlanGate,
  ChildHero,
  DashboardPanel,
  childHeroProgress,
  PlanProgressCard,
} from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { childFacts } from '@/features/children';
import { TeacherNotesSection } from '@/features/feedback';
import { ChildPlanPanel, PlanActivityResultDetails } from '@/features/training-plans';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildPlanActivities, useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { summarizePlan } from '@/services/api/planSummary';

import styles from './ChildDashboardPage.module.css';

/**
 * Teacher child file (client revision 2026-11): plan progress (ring, %, figures), the filterable
 * activity history with read-only «عرض النتيجة», teacher notes and the child's answers as separate
 * question cards. The Teacher does not play the child's activities and has no initial-assessment
 * card or page; the plan still opens only after the assessment (server status). The teacher
 * cannot edit the plan or reports.
 */
export function TeacherChildPage() {
  const { childId = '' } = useParams();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Teacher');
  const child = children.data?.find((item) => item.id === childId);
  const plan = useChildPlanActivities(child?.id);
  const assessment = useAssessmentStatus(child ? child.id : undefined);
  const isPlanOpen = assessment.state === 'complete' || assessment.state === 'unavailable';
  const summary = plan.data && isPlanOpen ? summarizePlan(plan.data) : null;

  const completedActivities = (plan.data ?? []).filter((activity) => activity.isCompleted);
  const selectedActivity =
    completedActivities.find((activity) => activity.id === selectedActivityId) ??
    completedActivities[0];

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
        <div className={styles.teacherSummary}>
          <ChildHero
            tone="soft"
            name={child.fullName}
            eyebrow="الخطة التدريبية وملاحظات المعلم"
            facts={childFacts(child, { withParent: true })}
            progress={childHeroProgress(summary)}
          />
          {summary && summary.total > 0 ? <PlanProgressCard summary={summary} /> : null}
        </div>
        <div className={styles.main}>
          <div className={styles.main}>
            <AssessmentPlanGate status={assessment}>
              <ChildPlanPanel
                childId={child.id}
                showSummary={false}
                onSelectResult={(activity) => {
                  setSelectedActivityId(activity.id);
                }}
                showAnswers
              />
            </AssessmentPlanGate>
          </div>
          <div className={styles.columns}>
            <TeacherNotesSection childId={child.id} />
            <DashboardPanel
              id="teacher-child-answers"
              title="نتيجة النشاط وإجابات الطفل"
              icon={Eye}
            >
              {selectedActivity ? (
                <>
                  <FormField label="النشاط المكتمل">
                    {(field) => (
                      <Select
                        {...field}
                        value={selectedActivity.id}
                        onChange={(event) => {
                          setSelectedActivityId(event.target.value);
                        }}
                      >
                        {completedActivities.map((activity) => (
                          <option value={activity.id} key={activity.id}>
                            {activity.title}
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormField>
                  <PlanActivityResultDetails
                    key={selectedActivity.id}
                    childId={child.id}
                    planActivityId={selectedActivity.id}
                    title={selectedActivity.title}
                    initiallyOpen
                  />
                </>
              ) : (
                <p>تظهر إجابات الطفل هنا بعد إكمال أحد الأنشطة.</p>
              )}
            </DashboardPanel>
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
