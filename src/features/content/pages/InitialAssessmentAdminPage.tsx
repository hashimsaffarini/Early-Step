import { mediaKeys } from '@/services/media/localMedia';
import {
  CircleMinus,
  CirclePlus,
  ClipboardCheck,
  ClipboardList,
  FolderTree,
  Gamepad2,
  ImageIcon,
  ListPlus,
} from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';

import {
  useAssessmentCategoryIds,
  useCategories,
  useCategoryQuestions,
  useToggleAssessmentCategory,
  useSetAssessmentQuestions,
} from '../api/contentQueries';
import styles from '../components/content.module.css';
import { AssessmentCategoryBrowser } from '../components/AssessmentCategoryBrowser';
import { ContentPage } from '../components/ContentPage';
import { QueryStatus } from '../components/QueryStatus';
import { ACTIVITY_TYPE_SINGULAR, QUESTION_TYPE_LABELS, type Category } from '../types';

import { readAssessmentActions, type QuestionActions } from '../api/assessmentSelectionCache';
import { AssessmentMembershipCheckbox } from '../components/AssessmentMembershipCheckbox';

interface QuestionActionsProps {
  actions: QuestionActions;
  onToggle: (questionId: string, include: boolean) => void;
  onToggleGroup: (ids: string[], include: boolean) => void;
  pending: boolean;
}

/**
 * The questions that belong to one category of the assessment, grouped by activity, with
 * add / remove actions (`POST initial-assessment/questions`, `DELETE …/questions/{id}`).
 */
function CategoryQuestions({
  category,
  actions,
  onToggle,
  onToggleGroup,
  pending,
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
            <span className={styles.treeIcon} aria-hidden="true">
              <ServerImage
                path={group.activity.iconUrl}
                mediaKey={mediaKeys.activity(group.activity.type ?? '', group.activity.id)}
                alt=""
                fallback={group.activity.type === 'game' ? <Gamepad2 /> : <ClipboardList />}
              />
            </span>
            <span className={styles.levelText}>
              <span className={styles.levelLabel}>
                {group.activity.type ? ACTIVITY_TYPE_SINGULAR[group.activity.type] : 'نشاط'}
              </span>
              {group.activity.title}
            </span>
            <span className={styles.muted}>{`(${group.questions.length.toString()} أسئلة)`}</span>
          </h4>
          <AssessmentMembershipCheckbox
            label={`تضمين جميع أسئلة ${group.activity.title}`}
            value={
              group.questions.every((question) => actions[question.id] === 'added')
                ? true
                : group.questions.every((question) => actions[question.id] === 'removed')
                  ? false
                  : null
            }
            disabled={
              pending ||
              group.questions.some(
                (question) => question.options.length === 0 || question.type === null,
              )
            }
            onChange={(include) => {
              onToggleGroup(
                group.questions.map((question) => question.id),
                include,
              );
            }}
          />
          <ol className={styles.questionList}>
            {group.questions.map((question, index) => {
              const label = question.text || `السؤال ${(index + 1).toString()}`;
              const action = actions[question.id];
              return (
                <li key={question.id} className={styles.questionRow}>
                  <span className={styles.questionNumber} aria-hidden="true">
                    {(index + 1).toString()}
                  </span>
                  <AssessmentMembershipCheckbox
                    compact
                    label={`تضمين السؤال: ${label}`}
                    value={action ? action === 'added' : null}
                    disabled={pending || question.options.length === 0 || question.type === null}
                    onChange={(include) => {
                      onToggle(question.id, include);
                    }}
                  />
                  {question.imageUrl ? (
                    <span className={styles.questionThumb}>
                      <ServerImage
                        path={question.imageUrl}
                        mediaKey={mediaKeys.question(question.id)}
                        alt={`صورة السؤال ${(index + 1).toString()}`}
                        fallback={<ImageIcon aria-hidden="true" />}
                      />
                    </span>
                  ) : null}
                  <div className={styles.rowMain}>
                    <span className={styles.questionText}>{label}</span>
                    {question.type ? (
                      <span className={styles.muted}>{QUESTION_TYPE_LABELS[question.type]}</span>
                    ) : null}
                    {action ? (
                      <p className={styles.muted} role="status">
                        {action === 'added'
                          ? 'آخر إجراء محفوظ على هذا المتصفح: إضافة إلى التقييم.'
                          : 'آخر إجراء محفوظ على هذا المتصفح: إزالة من التقييم.'}
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
  const toggleQuestion = useSetAssessmentQuestions();
  const [questionActions, setQuestionActions] = useState<QuestionActions>(readAssessmentActions);

  const memberSet = new Set(memberIds.data ?? []);
  const categories = categoriesQuery.data ?? [];
  const inAssessment = categories.filter((category) => memberSet.has(category.id));
  const isLoading = categoriesQuery.isPending || memberIds.isPending;
  const loadError = categoriesQuery.error ?? memberIds.error;
  const retry = () => {
    void categoriesQuery.refetch();
    void memberIds.refetch();
  };

  const runQuestions = (ids: string[], include: boolean) => {
    toggleQuestion.mutate(
      { ids, include },
      {
        onSettled: () => {
          setQuestionActions(readAssessmentActions());
        },
      },
    );
  };
  const runQuestion = (id: string, include: boolean) => {
    runQuestions([id], include);
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
        <ApiErrorAlert error={toggleCategory.error} />
        <ApiErrorAlert error={toggleQuestion.error} />
        <div className={styles.assessmentRoot}>
          <span className={styles.rootIcon} aria-hidden="true">
            <ClipboardCheck />
          </span>
          <div className={styles.rowMain}>
            <p className={styles.rootTitle}>التقييم الأولي</p>
            <p className={styles.muted}>التصنيف ← النشاط (اختبار أو لعبة) ← الأسئلة التابعة له.</p>
          </div>
          {!isLoading && !loadError ? (
            <Badge tone="primary">{`التصنيفات: ${inAssessment.length.toString()}`}</Badge>
          ) : null}
        </div>
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
              السؤال من آخر الإجراءات المحفوظة على هذا المتصفح. قد تختلف عن تعديلات الأجهزة الأخرى؛
              علامة الاختيار الجزئي تعني أن الحالة غير مؤكدة.
            </Alert>
            <ol className={styles.tree} aria-label="تصنيفات التقييم المبدئي">
              {inAssessment.map((category, index) => (
                <li key={category.id} className={styles.categoryBlock}>
                  <div className={styles.categoryHead}>
                    <span className={styles.categoryIndex} aria-hidden="true">
                      {(index + 1).toString()}
                    </span>
                    <h3 className={styles.categoryTitle}>
                      <span className={styles.levelLabel}>التصنيف:</span>{' '}
                      <span>{category.name}</span>
                    </h3>
                    {categoryButton(category)}
                  </div>
                  <CategoryQuestions
                    category={category}
                    actions={questionActions}
                    onToggle={runQuestion}
                    onToggleGroup={runQuestions}
                    pending={toggleQuestion.isPending}
                  />
                </li>
              ))}
            </ol>
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
          <AssessmentCategoryBrowser
            categories={categories}
            memberIds={memberSet}
            pending={toggleCategory.isPending}
            onToggle={(id, include) => {
              toggleCategory.mutate({ id, include });
            }}
          />
        ) : null}
      </section>
    </ContentPage>
  );
}
