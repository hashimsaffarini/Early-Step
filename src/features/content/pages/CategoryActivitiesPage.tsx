import { ArrowRight, ChevronLeft, ClipboardList, FolderTree, Gamepad2 } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { getButtonClassName } from '@/components/ui/Button';
import { ADMIN_PATHS } from '@/constants/routes';
import type { ActivityType } from '@/services/api/activityType';

import { useActivities, useCategories } from '../api/contentQueries';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import { ACTIVITY_TYPE_SINGULAR, type ActivitySummary } from '../types';

interface Row {
  activity: ActivitySummary;
  type: ActivityType;
}

/**
 * The activities of one category (client revision 2026-10: clicking a category card opens it).
 * Tests and games of that category only (`GET Admin/activities/{test|game}?categoryId=`), each with
 * its real icon, type, question count and a link to edit it.
 */
export function CategoryActivitiesPage() {
  const { categoryId = '' } = useParams();
  const categories = useCategories();
  const tests = useActivities('test', categoryId);
  const games = useActivities('game', categoryId);
  const category = categories.data?.find((item) => item.id === categoryId);
  const title = category?.name ? `التصنيف: ${category.name}` : 'أنشطة التصنيف';
  const rows: Row[] = [
    ...(tests.data ?? []).map((activity) => ({ activity, type: 'test' as const })),
    ...(games.data ?? []).map((activity) => ({ activity, type: 'game' as const })),
  ];
  const isLoading = tests.isPending || games.isPending || categories.isPending;
  const error = tests.error ?? games.error ?? categories.error;

  const backLink = (
    <Link to={ADMIN_PATHS.categories} className={getButtonClassName({ variant: 'outline' })}>
      <ArrowRight aria-hidden="true" />
      كل التصنيفات
    </Link>
  );

  if (categories.isSuccess && !category) {
    return (
      <ContentPage title="التصنيف غير موجود" actions={backLink}>
        <EmptyState
          icon={<FolderTree />}
          title="لم يتم العثور على التصنيف"
          description="قد يكون التصنيف محذوفاً أو أن الرابط غير صحيح."
        />
      </ContentPage>
    );
  }

  return (
    <ContentPage
      title={title}
      subtitle="الاختبارات والألعاب التابعة لهذا التصنيف."
      actions={backLink}
    >
      <QueryStatus
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
        emptyTitle="لا توجد أنشطة ضمن هذا التصنيف."
        emptyDescription="أضف اختباراً أو لعبة من صفحة «الأنشطة والأسئلة» واختر هذا التصنيف."
        onRetry={() => {
          void tests.refetch();
          void games.refetch();
          void categories.refetch();
        }}
      />
      {!isLoading && !error && rows.length > 0 ? (
        <ul className={styles.list} aria-label={title}>
          {rows.map(({ activity, type }) => (
            <li key={`${type}-${activity.id}`} className={styles.categoryCard}>
              <Link
                to={ADMIN_PATHS.activityDetail(type, activity.id)}
                className={styles.categoryLink}
              >
                <span className={styles.rowIcon} aria-hidden="true">
                  <ServerImage
                    path={activity.iconUrl}
                    alt=""
                    fallback={type === 'game' ? <Gamepad2 /> : <ClipboardList />}
                  />
                </span>
                <span className={styles.rowMain}>
                  <h2 className={styles.rowTitle}>{activity.title || 'نشاط بلا عنوان'}</h2>
                  <span className={styles.meta}>
                    <Badge tone={type === 'game' ? 'accent' : 'primary'}>
                      {ACTIVITY_TYPE_SINGULAR[type]}
                    </Badge>
                    {activity.questionCount !== null ? (
                      <Badge>{`${activity.questionCount.toString()} أسئلة`}</Badge>
                    ) : null}
                  </span>
                </span>
                <ChevronLeft className={styles.categoryChevron} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </ContentPage>
  );
}
