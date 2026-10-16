import {
  CircleMinus,
  CirclePlus,
  ClipboardList,
  FolderTree,
  Gamepad2,
  ListPlus,
} from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';

import {
  useAssessmentCategoryIds,
  useCategories,
  useCategoryQuestions,
  useToggleAssessmentCategory,
  useToggleAssessmentQuestion,
} from '../api/contentQueries';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import type { Category } from '../types';

type QuestionAction = 'added' | 'removed';
type QuestionActions = Record<string, QuestionAction>;

interface QuestionActionsProps {
  actions: QuestionActions;
  onToggle: (questionId: string, include: boolean) => void;
}

/**
 * The questions that belong to one category of the assessment, grouped by activity, with
 * add / remove actions (`POST initial-assessment/questions`, `DELETE …/questions/{id}`).
 */
function CategoryQuestions({
  category,
  actions,
  onToggle,
}: { category: Category } & QuestionActionsProps) {
  const query = useCategoryQuestions(category.id);
  const groups = query.data ?? [];
  return (
    <div className={styles.categoryQuestions}>
      <QueryStatus
        isLoading={query.isPending}
        error={query.error}
        isEmpty={groups.length === 0}
        emptyTitle="لا توجد أسئلة في هذا التصنيف"
        emptyDescription="أضف اختبارات أو ألعاباً بأسئلة إلى هذا التصنيف من صفحة الأنشطة."
        onRetry={() => void query.refetch()}
      />
      {groups.map((group) => (
        <section
          key={group.activity.id}
          aria-label={group.activity.title}
          className={styles.activityGroup}
        >
          <h4 className={styles.groupTitle}>
            {group.activity.type === 'game' ? (
              <Gamepad2 aria-hidden="true" />
            ) : (
              <ClipboardList aria-hidden="true" />
            )}
            {group.activity.title}
            <span className={styles.muted}>{`(${group.questions.length.toString()} أسئلة)`}</span>
          </h4>
          <ol className={styles.questionList}>
            {group.questions.map((question, index) => {
              const label = question.text || `السؤال ${(index + 1).toString()}`;
              const action = actions[question.id];
              return (
                <li key={question.id} className={styles.questionRow}>
                  <div className={styles.rowMain}>
                    <span>
                      <span className={styles.questionNumber}>{`${(index + 1).toString()}.`}</span>
                      {label}
                    </span>
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
                        onToggle(question.id, true);
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
                        onToggle(question.id, false);
                      }}
                    >
                      إزالة
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/**
 * Initial-assessment composition (client revision 2026-10), shown as a hierarchy:
 * التقييم المبدئي → its categories → the questions that belong to each category.
 * - Membership source of truth: `GET initial-assessment/categories` (re-verified live 2026-10-16:
 *   add / remove are immediate). Every category of `Admin/categories` can be added — not only the
 *   ones that already have test activities (the cause of "a new category does not appear").
 * - The API has no list of the questions already in the assessment (BACKEND_REQUESTS), so a
 *   question's membership is shown only for actions done in this session.
 */
export function InitialAssessmentAdminPage() {
  const categoriesQuery = useCategories();
  const memberIds = useAssessmentCategoryIds();
  const toggleCategory = useToggleAssessmentCategory();
  const toggleQuestion = useToggleAssessmentQuestion();
  const [questionActions, setQuestionActions] = useState<QuestionActions>({});

  const memberSet = new Set(memberIds.data ?? []);
  const categories = categoriesQuery.data ?? [];
  const inAssessment = categories.filter((category) => memberSet.has(category.id));
  const isLoading = categoriesQuery.isPending || memberIds.isPending;
  const loadError = categoriesQuery.error ?? memberIds.error;
  const retry = () => {
    void categoriesQuery.refetch();
    void memberIds.refetch();
  };

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

  const categoryButton = (category: Category) => {
    const isMember = memberSet.has(category.id);
    return (
      <Button
        variant={isMember ? 'outline' : 'soft'}
        size="sm"
        isLoading={toggleCategory.isPending && toggleCategory.variables.id === category.id}
        iconStart={
          isMember ? <CircleMinus aria-hidden="true" /> : <CirclePlus aria-hidden="true" />
        }
        onClick={() => {
          toggleCategory.mutate({ id: category.id, include: !isMember });
        }}
      >
        {isMember ? `إزالة ${category.name} من التقييم` : `إضافة ${category.name} إلى التقييم`}
      </Button>
    );
  };

  return (
    <ContentPage
      title="التقييم المبدئي"
      subtitle="التصنيفات التي يتكوّن منها التقييم المبدئي، والأسئلة التابعة لكل تصنيف."
    >
      <section className={styles.page} aria-labelledby="assessment-structure">
        <SectionHeader id="assessment-structure" title="محتوى التقييم المبدئي" icon={FolderTree} />
        <p className={styles.muted}>التصنيف ← النشاط ← الأسئلة التابعة له.</p>
        <ApiErrorAlert error={toggleCategory.error} />
        <ApiErrorAlert error={toggleQuestion.error} />
        <QueryStatus
          isLoading={isLoading}
          error={loadError}
          isEmpty={inAssessment.length === 0}
          emptyTitle="لا توجد تصنيفات في التقييم المبدئي بعد"
          emptyDescription="أضف تصنيفاً من «كل التصنيفات» أدناه."
          onRetry={retry}
        />
        {inAssessment.length > 0 ? (
          <>
            <Alert tone="info">
              لا توفّر الواجهة البرمجية قائمة بالأسئلة المضافة حالياً إلى التقييم، لذا تظهر حالة
              السؤال فقط للإجراءات التي نفّذتها في هذه الجلسة.
            </Alert>
            <ul className={styles.list} aria-label="تصنيفات التقييم المبدئي">
              {inAssessment.map((category) => (
                <li key={category.id} className={styles.categoryBlock}>
                  <div className={styles.toolbar}>
                    <h3 className={styles.categoryTitle}>
                      <FolderTree aria-hidden="true" />
                      {`التصنيف: ${category.name}`}
                    </h3>
                    {categoryButton(category)}
                  </div>
                  <CategoryQuestions
                    category={category}
                    actions={questionActions}
                    onToggle={runQuestion}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className={styles.page} aria-labelledby="all-categories">
        <SectionHeader id="all-categories" title="كل التصنيفات" icon={ListPlus} />
        <p className={styles.muted}>
          أضف تصنيفاً إلى التقييم أو أزله منه؛ التصنيفات المضافة تظهر مع أسئلتها في الأعلى.
        </p>
        <QueryStatus
          isLoading={isLoading}
          error={loadError}
          isEmpty={categories.length === 0}
          emptyTitle="لا توجد تصنيفات"
          emptyDescription="أنشئ تصنيفاً من صفحة التصنيفات أولاً."
          onRetry={retry}
        />
        {!isLoading && !loadError && categories.length > 0 ? (
          <ul className={styles.list} aria-label="كل التصنيفات">
            {categories.map((category) => {
              const isMember = memberSet.has(category.id);
              return (
                <li key={category.id} className={styles.row}>
                  <span />
                  <div className={styles.rowMain}>
                    <h3 className={styles.rowTitle}>{category.name}</h3>
                    <ul className={styles.meta}>
                      <li>
                        <Badge tone={isMember ? 'success' : 'neutral'} hasDot>
                          {isMember ? 'ضمن التقييم' : 'غير مضاف'}
                        </Badge>
                      </li>
                    </ul>
                  </div>
                  <div className={styles.actions}>{categoryButton(category)}</div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </ContentPage>
  );
}
