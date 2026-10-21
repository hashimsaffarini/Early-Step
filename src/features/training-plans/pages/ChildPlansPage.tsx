import { ArrowRight, BookOpen, UserX } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { AppError } from '@/services/http/apiError';

import { ChildPlanPanel } from '../components/ChildPlanPanel';
import { SpecialistPlanEditor } from '../components/SpecialistPlanEditor';

import styles from './ChildPlansPage.module.css';

interface PlanChild {
  id: string;
  name: string;
}

function LoadError({
  error,
  onRetry,
  title = 'تعذّر تحميل الخطة التدريبية',
}: {
  error: AppError;
  onRetry: () => void;
  title?: string;
}) {
  return (
    <ErrorState
      title={title}
      description={error.message}
      action={
        <Button variant="outline" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      }
    />
  );
}

/**
 * Training plan for one child. The real model is a list of assigned activities (Replit's
 * free-text IEP — goals, strategies, notes — has no API and is not migrated).
 */
export function ChildPlansPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const childrenQuery = useChildrenForRole(role);

  const notFound = (
    <div className={styles.page}>
      <Link to={paths.children} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى الأطفال
      </Link>
      <EmptyState
        icon={<UserX />}
        title="لم يتم العثور على الطفل"
        description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
        action={
          <Link to={paths.children} className={getButtonClassName()}>
            العودة إلى الأطفال
          </Link>
        }
      />
    </div>
  );

  if (role === 'Admin') {
    return (
      <div className={styles.page}>
        <Link to={paths.children} className={styles.backLink}>
          <ArrowRight aria-hidden="true" />
          العودة إلى الأطفال
        </Link>
        <EmptyState
          icon={<BookOpen />}
          title="الخطط التدريبية غير متاحة لحساب المدير بعد"
          description="لا يوفّر الخادم حالياً طريقة لعرض الخطط التدريبية للمدير."
        />
      </div>
    );
  }
  if (childrenQuery.isPending) return <LoadingState />;
  if (childrenQuery.error) {
    return (
      <div className={styles.page}>
        <LoadError
          error={childrenQuery.error}
          title="تعذّر تحميل قائمة الأطفال"
          onRetry={() => {
            void childrenQuery.refetch();
          }}
        />
      </div>
    );
  }

  const found = childrenQuery.data.find((candidate) => candidate.id === childId);
  if (!found) return notFound;
  const child: PlanChild = { id: found.id, name: found.fullName };

  return (
    <div className={styles.page}>
      <Link to={paths.childProfile(child.id)} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى ملف {child.name}
      </Link>

      <PageBanner
        tone="violet"
        title="الخطة التدريبية"
        subtitle={`للطفل: ${child.name}`}
        aside={
          <span className={styles.bannerIcon} aria-hidden="true">
            <BookOpen />
          </span>
        }
      />

      {role === 'Specialist' ? (
        <SpecialistPlanEditor child={child} />
      ) : (
        <ChildPlanPanel childId={child.id} />
      )}
    </div>
  );
}
