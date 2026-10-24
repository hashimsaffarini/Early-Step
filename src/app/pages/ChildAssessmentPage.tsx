import { ArrowRight, ClipboardCheck, Lock, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { DashboardPanel } from '@/components/shared/ChildDashboard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { AssessmentResultView } from '@/features/children';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import styles from './ChildDashboardPage.module.css';

/**
 * The child's initial-assessment details on their own page (client revision 2026-10: the child
 * page shows a compact card that opens this page). Real result only
 * (`GET initial-assessment/{childId}/result`): overall result, each category with its percentage
 * and counts, and every question with its type, the child's answers, the correct answers and the
 * verdict — only what the server sends.
 */
export function ChildAssessmentPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const children = useChildrenForRole(role);
  const child = children.data?.find((item) => item.id === childId);
  const status = useAssessmentStatus(child ? child.id : undefined);
  const backTo = paths.childProfile(childId);

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
    let result;
    switch (status.state) {
      case 'loading':
        result = <LoadingState label="جارٍ تحميل نتيجة التقييم…" />;
        break;
      case 'error':
        result = (
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
        break;
      case 'incomplete':
        result = (
          <EmptyState
            icon={<ClipboardCheck />}
            title="لم يكتمل التقييم الأولي بعد."
            description="ستظهر النتيجة هنا بعد أن يُكمل الطفل التقييم الأولي."
          />
        );
        break;
      case 'unavailable':
        result = (
          <EmptyState
            icon={<Lock />}
            title="نتيجة التقييم الأولي غير متاحة لهذا الحساب"
            description="يعرض الخادم نتيجة التقييم للأخصائي المتابِع للطفل."
          />
        );
        break;
      case 'complete':
        result = (
          <DashboardPanel id="assessment-result-title" title="النتيجة" icon={ClipboardCheck}>
            <AssessmentResultView result={status.result} isExpanded />
          </DashboardPanel>
        );
        break;
    }
    body = (
      <>
        <PageHeader title="التقييم الأولي" subtitle={child.fullName} />
        {result}
      </>
    );
  }

  return (
    <div className={styles.page}>
      <Link to={backTo} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى ملف الطفل
      </Link>
      {body}
    </div>
  );
}
