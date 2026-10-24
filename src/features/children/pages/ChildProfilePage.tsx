import { ArrowRight, ClipboardCheck, Pencil, ServerOff, Target, UserX } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import {
  AssessmentPlanGate,
  ChildHero,
  childHeroProgress,
  DashboardPanel,
  PlanStatGrid,
} from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PlanActivityList } from '@/components/shared/PlanActivityList';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildPlanActivities } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ChildSummary } from '@/services/api/childrenLists';
import { summarizePlan } from '@/services/api/planSummary';

import { ChildFormDialog } from '../components/ChildFormDialog';
import { childFacts } from '../components/profile/childFacts';
import styles from '../components/profile/profile.module.css';
import { StartAssessmentLink } from '../components/profile/StartAssessmentLink';
import { QueryStatus } from '../components/profile/TabStatus';
import { useChildProfile } from '../hooks/useChildProfile';

import { BACK_TO_CHILDREN } from './childrenCopy';
import pageStyles from './ChildProfilePage.module.css';

/**
 * The parent's child page (client revision 2026-10, dashboard style): header with the child's
 * facts and plan progress, the plan's stat cards, then the initial assessment and the training-plan
 * activities. No reports and no delete action for the parent (client request).
 */
function ParentChildDashboard({ child }: { child: ChildSummary }) {
  const { paths } = useRoleArea();
  const plan = useChildPlanActivities(child.id);
  const assessment = useAssessmentStatus(child.id);
  // Client revision 2026-10: the plan appears after the initial assessment is completed.
  const isPlanOpen = assessment.state === 'complete' || assessment.state === 'unavailable';
  const [isEditOpen, setIsEditOpen] = useState(false);
  const toast = useToast();
  const summary = plan.data && isPlanOpen ? summarizePlan(plan.data) : null;

  let planBody: ReactNode;
  if (plan.isPending || plan.isError) {
    planBody = <QueryStatus query={plan} errorTitle="تعذّر تحميل الخطة التدريبية" />;
  } else if (plan.data.length === 0) {
    planBody = (
      <p className={styles.muted}>
        لا توجد أنشطة في الخطة بعد. يُضيف الأخصائي الأنشطة والألعاب بعد مراجعة التقييم المبدئي.
      </p>
    );
  } else {
    planBody = (
      <PlanActivityList
        activities={plan.data}
        playTo={(activity) => paths.planActivityPlay(child.id, activity.activityId)}
      />
    );
  }

  return (
    <>
      <ChildHero
        name={child.fullName}
        eyebrow="ملف الطفل"
        facts={childFacts(child)}
        progress={childHeroProgress(summary)}
        actions={
          <Button
            variant="outline"
            iconStart={<Pencil aria-hidden="true" />}
            onClick={() => {
              setIsEditOpen(true);
            }}
          >
            تعديل البيانات
          </Button>
        }
      />
      {summary && summary.total > 0 ? <PlanStatGrid summary={summary} /> : null}
      <DashboardPanel
        id="child-assessment-title"
        title="التقييم المبدئي"
        icon={ClipboardCheck}
        action={
          assessment.state === 'complete' ? undefined : (
            <StartAssessmentLink childId={child.id} childName={child.fullName} />
          )
        }
      >
        <p className={styles.muted}>
          {assessment.state === 'complete'
            ? 'أكمل الطفل التقييم المبدئي، ويراجع الأخصائي نتيجته.'
            : 'يتكوّن التقييم المبدئي من أنشطة وألعاب قصيرة مناسبة لعمر الطفل، ويراجع الأخصائي نتيجته.'}
        </p>
      </DashboardPanel>
      <DashboardPanel id="child-plan-title" title="الخطة التدريبية" icon={Target} iconTone="accent">
        <AssessmentPlanGate status={assessment}>{planBody}</AssessmentPlanGate>
      </DashboardPanel>
      <ChildFormDialog
        isOpen={isEditOpen}
        child={child}
        onClose={() => {
          setIsEditOpen(false);
        }}
        onSaved={() => {
          setIsEditOpen(false);
          toast.success('تم حفظ البيانات بنجاح');
        }}
      />
    </>
  );
}

/**
 * Child page of the Parent (`GET Parent/{childId}`). Teacher and Specialist have their own
 * plan-focused pages (`app/pages`); the Admin has no child endpoint (BLOCKED BY BACKEND).
 */
export function ChildProfilePage() {
  const { role, paths } = useRoleArea();
  const { childId = '' } = useParams();
  const profile = useChildProfile(role, childId);
  const backLabel = BACK_TO_CHILDREN[role];
  const backToList = (
    <Link to={paths.children} className={getButtonClassName()}>
      {backLabel}
    </Link>
  );

  let content: ReactNode;
  switch (profile.status) {
    case 'loading':
      content = <LoadingState label="جارٍ تحميل ملف الطفل…" />;
      break;
    case 'error':
      content = (
        <ErrorState
          title="تعذّر تحميل ملف الطفل"
          description={profile.error.message}
          action={
            <Button variant="outline" onClick={profile.retry}>
              إعادة المحاولة
            </Button>
          }
        />
      );
      break;
    case 'blocked':
      content = (
        <EmptyState
          icon={<ServerOff />}
          title="ملف الطفل غير متاح للمدير من الخادم"
          description="لا يوفّر الخادم حالياً بيانات ملف الطفل لحساب المدير."
          action={backToList}
        />
      );
      break;
    case 'not-found':
      content = (
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={backToList}
        />
      );
      break;
    case 'ready':
      content = <ParentChildDashboard child={profile.child} />;
      break;
  }

  return (
    <div className={pageStyles.page}>
      <Link to={paths.children} className={pageStyles.backLink}>
        <ArrowRight aria-hidden="true" />
        {backLabel}
      </Link>
      {content}
    </div>
  );
}
