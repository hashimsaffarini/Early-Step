import { CircleMinus, CirclePlus } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Alert } from '@/components/ui/Feedback';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Select } from '@/components/ui/Field';

import {
  useActivities,
  useActivity,
  useAssessmentCategoryIds,
  useCategoriesWithCounts,
  useToggleAssessmentCategory,
  useToggleAssessmentQuestion,
} from '../api/contentQueries';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';

/** The initial assessment is built from test categories and test questions (assumption). */
const ASSESSMENT_ACTIVITY_TYPE = 'test' as const;

type QuestionAction = 'added' | 'removed';

/**
 * Initial-assessment composition. Category membership comes from `initial-assessment/categories`
 * (re-verified live 2026-10-14: Admin 200 again; the `isInInitialAssessment` flag of
 * `categoriesActivity` is still always false, so it is not used). The API has **no endpoint listing the questions already in the
 * assessment** (BLOCKED BY BACKEND), so question actions only show what was done in this session.
 */
export function InitialAssessmentAdminPage() {
  const categoriesQuery = useCategoriesWithCounts(ASSESSMENT_ACTIVITY_TYPE);
  const toggleCategory = useToggleAssessmentCategory();
  const toggleQuestion = useToggleAssessmentQuestion();
  const activitiesQuery = useActivities(ASSESSMENT_ACTIVITY_TYPE);
  const [activityId, setActivityId] = useState('');
  const activityQuery = useActivity(activityId ? ASSESSMENT_ACTIVITY_TYPE : null, activityId);
  const [questionActions, setQuestionActions] = useState<Record<string, QuestionAction>>({});
  const memberIds = useAssessmentCategoryIds();
  const memberSet = new Set(memberIds.data ?? []);
  // Rows need both lists: without membership the badges would be wrong.
  const categories = memberIds.data
    ? (categoriesQuery.data ?? []).map((category) => ({
        ...category,
        isInInitialAssessment: memberSet.has(category.id),
      }))
    : [];

  const runQuestion = (questionId: string, include: boolean) => {
    toggleQuestion.mutate(
      { id: questionId, include },
      {
        onSuccess: () => {
          setQuestionActions((current) => ({
            ...current,
            [questionId]: include ? 'added' : 'removed',
          }));
        },
      },
    );
  };

  return (
    <ContentPage
      title="التقييم المبدئي"
      subtitle="اختر التصنيفات والأسئلة التي يتكوّن منها التقييم المبدئي للأطفال."
    >
      <section className={styles.page} aria-labelledby="assessment-categories">
        <SectionHeader id="assessment-categories" title="التصنيفات في التقييم" />
        <ApiErrorAlert error={toggleCategory.error} />
        <QueryStatus
          isLoading={categoriesQuery.isPending || memberIds.isPending}
          error={categoriesQuery.error ?? memberIds.error}
          isEmpty={categories.length === 0}
          emptyTitle="لا توجد تصنيفات"
          onRetry={() => {
            void categoriesQuery.refetch();
            void memberIds.refetch();
          }}
        />
        {categories.length > 0 ? (
          <ul className={styles.list} aria-label="تصنيفات الاختبارات">
            {categories.map((category) => (
              <li key={category.id} className={styles.row}>
                <span />
                <div className={styles.rowMain}>
                  <h3 className={styles.rowTitle}>{category.name}</h3>
                  <ul className={styles.meta}>
                    <li>
                      <Badge tone={category.isInInitialAssessment ? 'success' : 'neutral'} hasDot>
                        {category.isInInitialAssessment ? 'ضمن التقييم' : 'غير مضاف'}
                      </Badge>
                    </li>
                    {category.count !== null ? (
                      <li>
                        <Badge>{`${category.count.toString()} أنشطة`}</Badge>
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className={styles.actions}>
                  <Button
                    variant={category.isInInitialAssessment ? 'outline' : 'soft'}
                    size="sm"
                    isLoading={
                      toggleCategory.isPending && toggleCategory.variables.id === category.id
                    }
                    iconStart={
                      category.isInInitialAssessment ? (
                        <CircleMinus aria-hidden="true" />
                      ) : (
                        <CirclePlus aria-hidden="true" />
                      )
                    }
                    onClick={() => {
                      toggleCategory.mutate({
                        id: category.id,
                        include: !category.isInInitialAssessment,
                      });
                    }}
                  >
                    {category.isInInitialAssessment
                      ? `إزالة ${category.name} من التقييم`
                      : `إضافة ${category.name} إلى التقييم`}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className={styles.page} aria-labelledby="assessment-questions">
        <SectionHeader id="assessment-questions" title="أسئلة التقييم" />
        <Alert tone="info">
          لا توفّر الواجهة البرمجية قائمة بالأسئلة المضافة حالياً إلى التقييم، لذا تظهر هنا فقط
          الإجراءات التي نفّذتها في هذه الجلسة.
        </Alert>
        <ApiErrorAlert
          error={activitiesQuery.error}
          message="تعذّر تحميل قائمة الاختبارات."
          onRetry={() => void activitiesQuery.refetch()}
        />
        <Card className={styles.filter}>
          <FormField label="اختر اختباراً لعرض أسئلته">
            {(field) => (
              <Select
                {...field}
                value={activityId}
                onChange={(event) => {
                  setActivityId(event.target.value);
                }}
              >
                <option value="">
                  {activitiesQuery.isPending
                    ? 'جارٍ تحميل الاختبارات…'
                    : activitiesQuery.data?.length === 0
                      ? 'لا توجد اختبارات بعد'
                      : 'اختر…'}
                </option>
                {(activitiesQuery.data ?? []).map((activity) => (
                  <option key={activity.id} value={activity.id}>
                    {activity.title}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </Card>
        <ApiErrorAlert error={toggleQuestion.error} />
        {activityId ? (
          <QueryStatus
            isLoading={activityQuery.isPending}
            error={activityQuery.error}
            isEmpty={(activityQuery.data?.questions.length ?? 0) === 0}
            emptyTitle="لا توجد أسئلة في هذا الاختبار"
            onRetry={() => void activityQuery.refetch()}
          />
        ) : null}
        {activityQuery.data && activityQuery.data.questions.length > 0 ? (
          <ul className={styles.list} aria-label="أسئلة الاختبار">
            {activityQuery.data.questions.map((question, index) => {
              const action = questionActions[question.id];
              const label = question.text || `السؤال ${(index + 1).toString()}`;
              return (
                <li key={question.id} className={styles.row}>
                  <span />
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{label}</h3>
                    {action ? (
                      <p className={styles.muted} role="status">
                        {action === 'added'
                          ? 'أُضيف إلى التقييم في هذه الجلسة.'
                          : 'أُزيل من التقييم في هذه الجلسة.'}
                      </p>
                    ) : null}
                  </div>
                  <div className={styles.actions}>
                    <Button
                      variant="soft"
                      size="sm"
                      iconStart={<CirclePlus aria-hidden="true" />}
                      aria-label={`إضافة «${label}» إلى التقييم`}
                      onClick={() => {
                        runQuestion(question.id, true);
                      }}
                    >
                      إضافة
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      iconStart={<CircleMinus aria-hidden="true" />}
                      aria-label={`إزالة «${label}» من التقييم`}
                      onClick={() => {
                        runQuestion(question.id, false);
                      }}
                    >
                      إزالة
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </ContentPage>
  );
}
