import { mediaKeys } from '@/services/media/localMedia';
import { resolveGameTemplate } from '@/components/games';
import { gameLevelDraft } from '../components/gameLevelDrafts';
import { ArrowRight, Gamepad2, ListChecks, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ADMIN_PATHS } from '@/constants/routes';
import { normalizeActivityType } from '@/services/api/activityType';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import { useActivity } from '../api/contentQueries';
import styles from '../components/content.module.css';
import { ContentPage } from '../components/ContentPage';
import { QuestionCard } from '../components/QuestionCard';
import { GamePreviewDialog } from '../components/GamePreviewDialog';
import { GameTemplatePanel } from '../components/GameTemplatePanel';
import { QuestionFormDialog } from '../components/QuestionFormDialog';
import { QueryStatus } from '../components/QueryStatus';
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_SINGULAR } from '../types';

/** One activity with its questions and options (add / edit / delete). */
export function ActivityDetailPage() {
  const { activityType, activityId } = useParams();
  const type = normalizeActivityType(activityType);
  const activityQuery = useActivity(type, activityId);
  const [isAdding, setIsAdding] = useState(false);
  const [useDraft, setUseDraft] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const listPath = `${ADMIN_PATHS.activities}?type=${type ?? 'test'}`;
  const backLink = (
    <Link to={listPath} className={getButtonClassName({ variant: 'ghost', size: 'sm' })}>
      <ArrowRight aria-hidden="true" />
      العودة إلى الأنشطة
    </Link>
  );

  const isNotFound = !type || activityQuery.error?.status === HTTP_STATUS.NOT_FOUND;
  if (isNotFound) {
    return (
      <ContentPage title="النشاط غير موجود" actions={backLink}>
        <EmptyState
          title="لم يتم العثور على النشاط"
          description="قد يكون قد حُذف أو أن الرابط غير صحيح."
        />
      </ContentPage>
    );
  }

  const activity = activityQuery.data;
  return (
    <ContentPage
      title={activity?.title ?? 'النشاط'}
      subtitle={ACTIVITY_TYPE_LABELS[type]}
      actions={backLink}
    >
      <QueryStatus
        isLoading={activityQuery.isPending}
        error={activityQuery.error}
        isEmpty={false}
        emptyTitle=""
        onRetry={() => void activityQuery.refetch()}
      />
      {activity ? (
        <>
          <Card className={styles.detailHead}>
            <span className={styles.detailIcon}>
              <ServerImage
                path={activity.iconUrl}
                mediaKey={mediaKeys.activity(type, activity.id)}
                alt={`أيقونة ${activity.title || 'النشاط'}`}
                fallback={
                  type === 'game' ? (
                    <Gamepad2 aria-hidden="true" />
                  ) : (
                    <ListChecks aria-hidden="true" />
                  )
                }
              />
            </span>
            <div className={styles.rowMain}>
              {activity.description ? <p className={styles.muted}>{activity.description}</p> : null}
              <ul className={styles.meta} aria-label="تفاصيل النشاط">
                <li>
                  <Badge tone={type === 'game' ? 'accent' : 'primary'}>
                    {ACTIVITY_TYPE_SINGULAR[type]}
                  </Badge>
                </li>
                {activity.categoryName ? (
                  <li>
                    <Badge tone="primary">{activity.categoryName}</Badge>
                  </li>
                ) : null}
                {activity.slug ? (
                  <li>
                    <Badge>
                      <bdi dir="ltr">{activity.slug}</bdi>
                    </Badge>
                  </li>
                ) : null}
                {activity.createdByName ? (
                  <li>
                    <Badge>{`أنشأه: ${activity.createdByName}`}</Badge>
                  </li>
                ) : null}
              </ul>
            </div>
          </Card>
          {type === 'game' ? (
            <>
              <GameTemplatePanel slug={activity.slug} questions={activity.questions} />
              <Button
                variant="outline"
                iconStart={<Gamepad2 aria-hidden="true" />}
                onClick={() => {
                  setIsPreviewing(true);
                }}
              >
                معاينة اللعبة
              </Button>
              {isPreviewing ? (
                <GamePreviewDialog
                  activity={activity}
                  onClose={() => {
                    setIsPreviewing(false);
                  }}
                />
              ) : null}
            </>
          ) : null}

          {type === 'game' ? (
            <Card className={styles.templatePanel}>
              <div className={styles.rowMain}>
                <h2 className={styles.rowTitle}>محتوى اللعبة</h2>
                <p className={styles.muted}>
                  أضف مستويات بالصور أو الرموز. يمكنك البدء بمستوى جاهز، وتعديل محتواه وصوره قبل
                  حفظه.
                </p>
              </div>
              <Button
                variant="soft"
                iconStart={<Gamepad2 aria-hidden="true" />}
                onClick={() => {
                  setUseDraft(true);
                  setIsAdding(true);
                }}
              >
                إضافة مستوى جاهز
              </Button>
            </Card>
          ) : null}
          <div className={styles.toolbar}>
            <h2
              className={styles.rowTitle}
            >{`الأسئلة (${activity.questions.length.toString()})`}</h2>
            <Button
              iconStart={<Plus aria-hidden="true" />}
              onClick={() => {
                setUseDraft(false);
                setIsAdding(true);
              }}
            >
              إضافة سؤال
            </Button>
          </div>
          {activity.questions.length === 0 ? (
            <EmptyState title="لا توجد أسئلة بعد" description="أضف أول سؤال لهذا النشاط." />
          ) : (
            <div className={styles.list}>
              {activity.questions.map((question, index) => (
                <QuestionCard key={question.id} question={question} index={index} />
              ))}
            </div>
          )}
          {isAdding ? (
            <QuestionFormDialog
              activityId={activity.id}
              activityType={type}
              isGameLevel={type === 'game'}
              initialValues={
                useDraft ? gameLevelDraft(resolveGameTemplate(activity.slug)?.slug) : undefined
              }
              onClose={() => {
                setIsAdding(false);
              }}
            />
          ) : null}
        </>
      ) : null}
    </ContentPage>
  );
}
