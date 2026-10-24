import { ChevronLeft, FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ADMIN_PATHS } from '@/constants/routes';

import {
  useCategories,
  useCategoryActivityCounts,
  useDeleteCategory,
  type CategoryActivityCount,
} from '../api/contentQueries';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import type { Category } from '../types';

type Editing = { mode: 'create' } | { mode: 'edit'; category: Category } | null;

const NO_COUNT: CategoryActivityCount = { tests: 0, games: 0 };

/**
 * Admin categories: list, create, rename, delete (confirmed). Client revision 2026-10: the whole
 * category card is a link to its activities, and the counts come from the real activity lists.
 */
export function CategoriesPage() {
  const categoriesQuery = useCategories();
  const activityCounts = useCategoryActivityCounts();
  const deleteMutation = useDeleteCategory();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const categories = categoriesQuery.data ?? [];

  return (
    <ContentPage
      title="التصنيفات"
      subtitle="تصنيفات الأنشطة (مثل الذاكرة، القراءة، الحساب)."
      actions={
        <Button
          iconStart={<Plus aria-hidden="true" />}
          onClick={() => {
            setEditing({ mode: 'create' });
          }}
        >
          إضافة تصنيف
        </Button>
      }
    >
      <ApiErrorAlert error={deleteMutation.error} />
      <ApiErrorAlert
        error={activityCounts.error}
        message="تعذّر تحميل أعداد الأنشطة."
        onRetry={activityCounts.refetch}
      />
      <QueryStatus
        isLoading={categoriesQuery.isPending}
        error={categoriesQuery.error}
        isEmpty={categories.length === 0}
        emptyTitle="لا توجد تصنيفات بعد"
        emptyDescription="أضف أول تصنيف لتنظيم الأنشطة."
        onRetry={() => void categoriesQuery.refetch()}
      />
      {categories.length > 0 ? (
        <ul className={styles.list} aria-label="التصنيفات">
          {categories.map((category) => (
            <li key={category.id} className={styles.categoryCard}>
              <Link
                to={ADMIN_PATHS.categoryActivities(category.id)}
                className={styles.categoryLink}
                aria-label={`أنشطة التصنيف ${category.name || 'تصنيف بلا اسم'}`}
              >
                <span className={styles.rowIcon} aria-hidden="true">
                  <FolderTree />
                </span>
                <span className={styles.rowMain}>
                  <h2 className={styles.rowTitle}>{category.name || 'تصنيف بلا اسم'}</h2>
                  <CategoryCounts
                    count={activityCounts.counts.get(category.id) ?? NO_COUNT}
                    isPending={activityCounts.isPending}
                    hasError={activityCounts.error !== null}
                  />
                </span>
                <ChevronLeft className={styles.categoryChevron} aria-hidden="true" />
              </Link>
              <div className={styles.actions}>
                <Button
                  variant="outline"
                  size="sm"
                  iconStart={<Pencil aria-hidden="true" />}
                  aria-label={`تعديل التصنيف ${category.name}`}
                  onClick={() => {
                    setEditing({ mode: 'edit', category });
                  }}
                >
                  تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconStart={<Trash2 aria-hidden="true" />}
                  aria-label={`حذف التصنيف ${category.name}`}
                  onClick={() => {
                    setDeleting(category);
                  }}
                >
                  حذف
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {editing ? (
        <CategoryFormDialog
          category={editing.mode === 'edit' ? editing.category : null}
          onClose={() => {
            setEditing(null);
          }}
        />
      ) : null}
      <ConfirmDialog
        isOpen={deleting !== null}
        title="حذف التصنيف"
        description={`سيتم حذف التصنيف «${deleting?.name ?? ''}». تأكد من أنه لم يعد مستخدماً في أي نشاط.`}
        confirmLabel="حذف"
        tone="danger"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteMutation.mutate(deleting.id, {
            onSettled: () => {
              setDeleting(null);
            },
          });
        }}
        onCancel={() => {
          setDeleting(null);
        }}
      />
    </ContentPage>
  );
}

/** «اختبارات: n · ألعاب: m» from the real activity lists (nothing shown while loading / failed). */
function CategoryCounts({
  count,
  isPending,
  hasError,
}: {
  count: CategoryActivityCount;
  isPending: boolean;
  hasError: boolean;
}) {
  if (isPending || hasError) return null;
  const total = count.tests + count.games;
  return (
    <span className={styles.meta}>
      <Badge tone={total > 0 ? 'primary' : 'neutral'}>{`الأنشطة: ${total.toString()}`}</Badge>
      <Badge>{`اختبارات: ${count.tests.toString()}`}</Badge>
      <Badge>{`ألعاب: ${count.games.toString()}`}</Badge>
    </span>
  );
}
