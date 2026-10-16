import { ArrowRight, BookOpen, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { TeacherNotesSection } from '@/features/feedback';
import { ChildPlanPanel } from '@/features/training-plans';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import styles from './TeacherChildPage.module.css';

/** The child's facts the teacher list sends (`GET Teacher/children`) — nothing invented. */
function childFacts(child: ChildSummary): string[] {
  const facts: string[] = [];
  if (child.age !== null) facts.push(`العمر: ${formatAge(child.age)}`);
  if (child.gender) facts.push(`الجنس: ${child.gender}`);
  if (child.parentName) facts.push(`ولي الأمر: ${child.parentName}`);
  return facts;
}

/**
 * The teacher's view of one assigned child (client revision 2026-10): focused on the training
 * plan — the child's info, the plan summary and progress, every assigned activity with its saved
 * result (and «ابدأ» to play it in class), and the teacher's notes with add / edit / delete.
 * No overview, initial-assessment or reports tabs for the teacher.
 */
export function TeacherChildPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Teacher');
  const child = children.data?.find((item) => item.id === childId);

  const backLink = (
    <Link to={paths.children} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      العودة إلى الأطفال
    </Link>
  );

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
    const facts = childFacts(child);
    body = (
      <>
        <PageBanner
          tone="violet"
          title={child.fullName}
          subtitle={facts.length > 0 ? facts.join(' · ') : 'الخطة التدريبية وملاحظات المعلم'}
          aside={
            <span className={styles.bannerIcon} aria-hidden="true">
              <BookOpen />
            </span>
          }
        />
        <ChildPlanPanel
          childId={child.id}
          playTo={(activity) => paths.planActivityPlay(child.id, activity.activityId)}
        />
        <TeacherNotesSection childId={child.id} />
      </>
    );
  }

  return (
    <div className={styles.page}>
      {backLink}
      {body}
    </div>
  );
}
