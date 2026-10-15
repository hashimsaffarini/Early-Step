import { useQueries } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { ROUTE_PATHS } from '@/constants/routes';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { fetchChildPlanSummary } from '@/services/api/childPlan';
import { fetchChildReport } from '@/services/api/childReports';
import { queryKeys } from '@/services/api/queryKeys';

import { ChildrenPreviewSection } from '../components/ChildrenPreviewSection';
import { ParentStatsGrid } from '../components/ParentStatsGrid';
import { ParentTipsCard } from '../components/ParentTipsCard';
import { ParentWelcomeBanner } from '../components/ParentWelcomeBanner';
import { PARENT_TIPS } from '../content/tips';
import type { DerivedCount } from '../types';

import styles from './ParentDashboardPage.module.css';

export interface ParentDashboardPageProps {
  /** Display name of the signed-in parent (from the session). */
  parentName: string;
}

interface PerChildResult<T> {
  data?: T | undefined;
  isError: boolean;
}

/** Sums a per-child count once every query has data; reports a failure instead of a number. */
function sumWhenReady<T>(
  results: readonly PerChildResult<T>[],
  pick: (value: T) => number,
): DerivedCount {
  if (results.some((result) => result.isError)) return 'error';
  if (results.some((result) => result.data === undefined)) return 'loading';
  return results.reduce((total, result) => total + (result.data ? pick(result.data) : 0), 0);
}

/**
 * Parent dashboard from the API: children (`GET Parent/GetMyChildren`), each child's plan summary
 * and reports. Replit's activity feed has no endpoint (BLOCKED BY BACKEND) and is not shown.
 */
export function ParentDashboardPage({ parentName }: ParentDashboardPageProps) {
  const childrenQuery = useChildrenForRole('Parent');
  const children = childrenQuery.data ?? [];
  const summaries = useQueries({
    queries: children.map((child) => ({
      queryKey: queryKeys.trainingPlans.childSummary(child.id),
      queryFn: () => fetchChildPlanSummary(child.id),
    })),
  });
  const reports = useQueries({
    queries: children.map((child) => ({
      queryKey: queryKeys.reports.byChild(child.id),
      queryFn: () => fetchChildReport(child.id),
    })),
  });

  let childrenSection;
  if (childrenQuery.isPending) {
    childrenSection = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (childrenQuery.isError) {
    childrenSection = (
      <ErrorState
        title="تعذّر تحميل قائمة الأطفال"
        description={childrenQuery.error.message}
        action={
          <Button variant="outline" onClick={() => void childrenQuery.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (children.length === 0) {
    childrenSection = (
      <EmptyState
        icon={<Users />}
        title="لم تُضف أي طفل بعد"
        description="أضف ملف طفلك للبدء بالتقييم المبدئي."
        action={
          <Link to={ROUTE_PATHS.parentChildren} className={getButtonClassName()}>
            <Plus aria-hidden="true" />
            إضافة طفل
          </Link>
        }
      />
    );
  } else {
    childrenSection = <ChildrenPreviewSection children={children} />;
  }

  return (
    <div className={styles.page}>
      <ParentWelcomeBanner parentName={parentName} />
      {childrenQuery.isSuccess ? (
        <ParentStatsGrid
          stats={{
            children: children.length,
            planActivities: sumWhenReady(summaries, (summary) => summary.totalCount),
            childrenWithReport: sumWhenReady(reports, (report) => (report ? 1 : 0)),
          }}
          onRetry={() => {
            for (const result of [...summaries, ...reports]) {
              if (result.isError) void result.refetch();
            }
          }}
        />
      ) : null}
      {childrenSection}
      <ParentTipsCard tips={PARENT_TIPS} />
    </div>
  );
}
