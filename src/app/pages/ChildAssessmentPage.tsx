import { ArrowRight, ClipboardCheck, Lock, UserX } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { ADMIN_PATHS } from '@/constants/routes';
import { AssessmentResultView } from '@/features/children';
import { useAssessmentStatus, type AssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import styles from './ChildDashboardPage.module.css';

/** The page that linked here (router state) — the Admin has no child page to go back to. */
function readFrom(state: unknown): string | null {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    return typeof state.from === 'string' ? state.from : null;
  }
  return null;
}

function ResultBody({ status }: { status: AssessmentStatus }) {
  switch (status.state) {
    case 'loading':
      return <LoadingState label="جارٍ تحميل نتيجة التقييم…" />;
    case 'error':
      return (
        <ErrorState
          title="تعذّر تحميل نتيجة التقييم"
          description={status.error.message}
          action={
            <Button variant="outline" onClick={status.retry}>
              إعادة المحاولة
            </Button>
          }
        />
      );
    case 'incomplete':
      return (
        <EmptyState
          icon={<ClipboardCheck />}
          title="لم يكتمل التقييم الأولي بعد."
          description="ستظهر النتيجة هنا بعد أن يُكمل الطفل التقييم الأولي."
        />
      );
    case 'unavailable':
      return (
        <EmptyState
          icon={<Lock />}
          title="نتيجة التقييم الأولي غير متاحة لهذا الحساب"
          description="يعرض الخادم نتيجة التقييم للأخصائي المتابِع للطفل وللمدير."
        />
      );
    case 'complete':
      return (
        <DashboardPanel id="assessment-result-title" title="النتيجة" icon={ClipboardCheck}>
          <AssessmentResultView result={status.result} isExpanded />
        </DashboardPanel>
      );
  }
}

function PageFrame({
  backTo,
  backLabel,
  children,
}: {
  backTo: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}

/**
 * Admin (client revision 2026-11: the initial-assessment results are visible to the Admin): the
 * same full result. The Admin has no children-list endpoint, so the child's name comes from the
 * result itself (`childName`, `parentName`).
 */
function AdminChildAssessment({ childId }: { childId: string }) {
  const status = useAssessmentStatus(childId);
  const backTo = readFrom(useLocation().state) ?? ADMIN_PATHS.users;
  const subtitle =
    status.state === 'complete'
      ? [
          status.result.childName,
          status.result.parentName && `ولي الأمر: ${status.result.parentName}`,
        ]
          .filter(Boolean)
          .join(' · ')
      : '';
  return (
    <PageFrame backTo={backTo} backLabel="رجوع">
      <PageHeader title="التقييم الأولي" subtitle={subtitle} />
      <ResultBody status={status} />
    </PageFrame>
  );
}

/** The Specialist's own children (from `specialist/children`). */
function StaffChildAssessment({ childId }: { childId: string }) {
  const { role, paths } = useRoleArea();
  const children = useChildrenForRole(role);
  const child = children.data?.find((item) => item.id === childId);
  const status = useAssessmentStatus(child ? child.id : undefined);

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
        <PageHeader title="التقييم الأولي" subtitle={child.fullName} />
        <ResultBody status={status} />
      </>
    );
  }

  return (
    <PageFrame backTo={paths.childProfile(childId)} backLabel="العودة إلى ملف الطفل">
      {body}
    </PageFrame>
  );
}

/**
 * The child's initial-assessment details on their own page (client revision 2026-10: the child
 * page shows a compact card that opens this page; 2026-11: the Admin reads it too). Real result only
 * (`GET initial-assessment/{childId}/result`): overall result, each category with its percentage
 * and counts, and every question with its type, the child's answers, the correct answers and the
 * verdict — only what the server sends.
 */
export function ChildAssessmentPage() {
  const { childId = '' } = useParams();
  const { role } = useRoleArea();
  if (role === 'Admin') return <AdminChildAssessment childId={childId} />;
  return <StaffChildAssessment childId={childId} />;
}
