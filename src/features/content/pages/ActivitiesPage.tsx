import { mediaKeys } from '@/services/media/localMedia';
import { FolderTree, Gamepad2, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormField, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import { ADMIN_PATHS } from '@/constants/routes';
import type { GameSlug } from '@/components/games';
import { normalizeActivityType, type ActivityType } from '@/services/api/activityType';

import { useActivities, useCategories, useDeleteActivity } from '../api/contentQueries';
import { ActivityFormDialog } from '../components/ActivityFormDialog';
import { GameTemplatesSection } from '../components/GameTemplatesSection';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import { ServerImage } from '@/components/shared/ServerImage';
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPE_SINGULAR,
  ADD_LABELS,
  type ActivitySummary,
  type Category,
} from '../types';

const TYPES: readonly ActivityType[] = ['test', 'game'];

type Editing =
  | { mode: 'create'; template?: GameSlug | undefined }
  | { mode: 'edit'; activity: ActivitySummary }
  | null;

interface CategoryGroup {
  id: string;
  name: string;
  activities: ActivitySummary[];
}

const UNCATEGORISED = 'بلا تصنيف';

/** Count label next to a category heading («اختبارات: 2»). */
const COUNT_LABELS: Record<ActivityType, string> = { test: 'اختبارات', game: 'ألعاب' };

/**
 * Activities under their category (client revision 2026-10: category → activities), in the
 * categories' order; an activity whose category is not listed goes under «بلا تصنيف».
 */
function groupByCategory(
  activities: readonly ActivitySummary[],
  categories: readonly Category[],
): CategoryGroup[] {
  const groups: CategoryGroup[] = categories.map((category) => ({
    id: category.id,
    name: category.name || 'تصنيف بلا اسم',
    activities: activities.filter((activity) => activity.categoryId === category.id),
  }));
  const known = new Set(categories.map((category) => category.id));
  const others = activities.filter(
    (activity) => activity.categoryId === null || !known.has(activity.categoryId),
  );
  if (others.length > 0) {
    groups.push({
      id: 'uncategorised',
      name: others[0]?.categoryName ?? UNCATEGORISED,
      activities: others,
    });
  }
  return groups.filter((group) => group.activities.length > 0);
}

/**
 * Admin activities per type (`?type=test|game`): tests and games are two real content types, each
 * grouped under its category (or filtered to one category).
 */
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
  const groups = groupByCategory(activities, categories);
  const canCreate = categories.length > 0;
  const openCreate = () => {
    setEditing({ mode: 'create' });
  };

  const updateParams = (next: { type?: ActivityType; categoryId?: string | undefined }) => {
    const params = new URLSearchParams({ type: next.type ?? type });
    const nextCategory = 'categoryId' in next ? next.categoryId : categoryId;
    if (nextCategory) params.set('categoryId', nextCategory);
    setSearchParams(params, { replace: true });
  };

  return (
    <ContentPage
      title="الأنشطة والأسئلة"
      subtitle="الاختبارات والألعاب مرتبة حسب التصنيف، مع أسئلتها."
      actions={
        <Button iconStart={<Plus aria-hidden="true" />} disabled={!canCreate} onClick={openCreate}>
          {ADD_LABELS[type]}
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
        emptyTitle={
          type === 'game'
            ? 'لا توجد ألعاب مضافة حالياً'
            : `لا توجد ${ACTIVITY_TYPE_LABELS[type]} هنا بعد`
        }
        {...(type === 'game'
          ? {
              emptyDescription: 'يمكن للإدارة إضافة ألعاب ليتم إسنادها لاحقاً ضمن الخطة التدريبية.',
            }
          : {})}
        {...(canCreate
          ? {
              emptyAction: (
                <Button iconStart={<Plus aria-hidden="true" />} onClick={openCreate}>
                  {ADD_LABELS[type]}
                </Button>
              ),
            }
          : {})}
        onRetry={() => void activitiesQuery.refetch()}
      />
      {type === 'game' && canCreate ? (
        <GameTemplatesSection
          onCreate={(template) => {
            setEditing({ mode: 'create', template });
          }}
        />
      ) : null}
      {groups.length > 0 ? (
        <div className={styles.categoryGroups}>
          {groups.map((group) => {
            const headingId = `activities-category-${group.id}`;
            return (
              <section
                key={group.id}
                className={styles.categorySection}
                aria-labelledby={headingId}
              >
                <h2 id={headingId} className={styles.categoryHeading}>
                  <FolderTree aria-hidden="true" />
                  {group.name}
                  <Badge>{`${COUNT_LABELS[type]}: ${group.activities.length.toString()}`}</Badge>
                </h2>
                <ul
                  className={styles.list}
                  aria-label={`${ACTIVITY_TYPE_LABELS[type]} — ${group.name}`}
                >
                  {group.activities.map((activity) => (
                    <li key={activity.id} className={styles.row}>
                      <span className={styles.rowIcon} aria-hidden="true">
                        <ServerImage
                          path={activity.iconUrl}
                          mediaKey={mediaKeys.activity(type, activity.id)}
                          alt=""
                          fallback={type === 'game' ? <Gamepad2 /> : <ListChecks />}
                        />
                      </span>
                      <div className={styles.rowMain}>
                        <h3 className={styles.rowTitle}>
                          <Link
                            to={ADMIN_PATHS.activityDetail(type, activity.id)}
                            className={styles.rowTitleLink}
                          >
                            {activity.title || 'نشاط بلا عنوان'}
                          </Link>
                        </h3>
                        {activity.description ? (
                          <p className={styles.muted}>{activity.description}</p>
                        ) : null}
                        <ul className={styles.meta} aria-label="تفاصيل النشاط">
                          <li>
                            <Badge tone={type === 'game' ? 'accent' : 'primary'}>
                              {ACTIVITY_TYPE_SINGULAR[type]}
                            </Badge>
                          </li>
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
              </section>
            );
          })}
        </div>
      ) : null}

      {editing ? (
        <ActivityFormDialog
          type={type}
          activity={editing.mode === 'edit' ? editing.activity : null}
          categories={categories}
          initialTemplate={editing.mode === 'create' ? editing.template : undefined}
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
