import { FolderTree, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';

import { useCategories, useDeleteCategory } from '../api/contentQueries';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import type { Category } from '../types';

type Editing = { mode: 'create' } | { mode: 'edit'; category: Category } | null;

/** Admin categories: list, create, rename, delete (confirmed). */
export function CategoriesPage() {
  const categoriesQuery = useCategories();
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
            <li key={category.id} className={styles.row}>
              <span className={styles.rowIcon} aria-hidden="true">
                <FolderTree />
              </span>
              <div className={styles.rowMain}>
                <h2 className={styles.rowTitle}>{category.name || 'تصنيف بلا اسم'}</h2>
                {category.count !== null ? (
                  <ul className={styles.meta}>
                    <li>
                      <Badge>{`${category.count.toString()} أنشطة`}</Badge>
                    </li>
                  </ul>
                ) : null}
              </div>
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
