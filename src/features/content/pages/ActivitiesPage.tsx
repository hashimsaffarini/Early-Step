import { Gamepad2, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ADMIN_PATHS } from '@/constants/routes';
import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';

import { useActivities, useCategories, useDeleteActivity } from '../api/contentQueries';
import { ActivityFormDialog } from '../components/ActivityFormDialog';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import { ServerImage } from '@/components/shared/ServerImage';
import { ACTIVITY_TYPE_LABELS, type ActivitySummary } from '../types';

const TYPES: readonly ActivityType[] = ['test', 'game'];

type Editing = { mode: 'create' } | { mode: 'edit'; activity: ActivitySummary } | null;

/** Admin activities per type (`?type=test|game`), filtered by category. */
export function ActivitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = normalizeActivityType(searchParams.get('type')) ?? 'test';
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const categoriesQuery = useCategories();
  const activitiesQuery = useActivities(type, categoryId);
  const deleteMutation = useDeleteActivity();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<ActivitySummary | null>(null);
  const categories = categoriesQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

  const updateParams = (next: { type?: ActivityType; categoryId?: string | undefined }) => {
    const params = new URLSearchParams({ type: next.type ?? type });
    const nextCategory = 'categoryId' in next ? next.categoryId : categoryId;
    if (nextCategory) params.set('categoryId', nextCategory);
    setSearchParams(params, { replace: true });
  };

  return (
    <ContentPage
      title="الأنشطة والأسئلة"
      subtitle="الاختبارات والألعاب وأسئلتها."
      actions={
        <Button
          iconStart={<Plus aria-hidden="true" />}
          disabled={categories.length === 0}
          onClick={() => {
            setEditing({ mode: 'create' });
          }}
        >
          إضافة نشاط
        </Button>
      }
    >
      <div className={styles.toolbar}>
        <div className={styles.typeToggle} role="group" aria-label="نوع النشاط">
          {TYPES.map((option) => (
            <Button
              key={option}
              variant={option === type ? 'primary' : 'outline'}
              size="sm"
              aria-pressed={option === type}
              onClick={() => {
                updateParams({ type: option });
              }}
            >
              {ACTIVITY_TYPE_LABELS[option]}
            </Button>
          ))}
        </div>
        <div className={styles.filter}>
          <FormField label="التصنيف">
            {(field) => (
              <Select
                {...field}
                value={categoryId ?? ''}
                onChange={(event) => {
                  updateParams({ categoryId: event.target.value || undefined });
                }}
              >
                <option value="">كل التصنيفات</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
      </div>

      <ApiErrorAlert
        error={categoriesQuery.error}
        message="تعذّر تحميل التصنيفات، لذلك لا يمكن التصفية أو إضافة نشاط الآن."
        onRetry={() => void categoriesQuery.refetch()}
      />
      {categoriesQuery.isSuccess && categories.length === 0 ? (
        <p className={styles.muted}>أضف تصنيفاً أولاً من صفحة التصنيفات لتتمكن من إضافة الأنشطة.</p>
      ) : null}
      <ApiErrorAlert error={deleteMutation.error} />
      <QueryStatus
        isLoading={activitiesQuery.isPending}
        error={activitiesQuery.error}
        isEmpty={activities.length === 0}
        emptyTitle={`لا توجد ${ACTIVITY_TYPE_LABELS[type]} هنا بعد`}
        onRetry={() => void activitiesQuery.refetch()}
      />
      {activities.length > 0 ? (
        <ul className={styles.list} aria-label={ACTIVITY_TYPE_LABELS[type]}>
          {activities.map((activity) => (
            <li key={activity.id} className={styles.row}>
              <span className={styles.rowIcon} aria-hidden="true">
                {activity.iconUrl ? (
                  <ServerImage path={activity.iconUrl} alt="" />
                ) : type === 'game' ? (
                  <Gamepad2 />
                ) : (
                  <ListChecks />
                )}
              </span>
              <div className={styles.rowMain}>
                <h2 className={styles.rowTitle}>
                  <Link
                    to={ADMIN_PATHS.activityDetail(type, activity.id)}
                    className={styles.rowTitleLink}
                  >
                    {activity.title || 'نشاط بلا عنوان'}
                  </Link>
                </h2>
                {activity.description ? (
                  <p className={styles.muted}>{activity.description}</p>
                ) : null}
                <ul className={styles.meta} aria-label="تفاصيل النشاط">
                  {activity.categoryName ? (
                    <li>
                      <Badge tone="primary">{activity.categoryName}</Badge>
                    </li>
                  ) : null}
                  {activity.questionCount !== null ? (
                    <li>
                      <Badge>{`${activity.questionCount.toString()} أسئلة`}</Badge>
                    </li>
                  ) : null}
                </ul>
              </div>
              <div className={styles.actions}>
                <Button
                  variant="outline"
                  size="sm"
                  iconStart={<Pencil aria-hidden="true" />}
                  aria-label={`تعديل النشاط ${activity.title}`}
                  onClick={() => {
                    setEditing({ mode: 'edit', activity });
                  }}
                >
                  تعديل
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  iconStart={<Trash2 aria-hidden="true" />}
                  aria-label={`حذف النشاط ${activity.title}`}
                  onClick={() => {
                    setDeleting(activity);
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
        <ActivityFormDialog
          type={type}
          activity={editing.mode === 'edit' ? editing.activity : null}
          categories={categories}
          onClose={() => {
            setEditing(null);
          }}
        />
      ) : null}
      <ConfirmDialog
        isOpen={deleting !== null}
        title="حذف النشاط"
        description={`سيتم حذف «${deleting?.title ?? ''}» مع أسئلته نهائياً.`}
        confirmLabel="حذف"
        tone="danger"
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleting) return;
          deleteMutation.mutate(
            { type, id: deleting.id },
            {
              onSettled: () => {
                setDeleting(null);
              },
            },
          );
        }}
        onCancel={() => {
          setDeleting(null);
        }}
      />
    </ContentPage>
  );
}
