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
            <GameTemplatePanel slug={activity.slug} questions={activity.questions} />
          ) : null}

          <div className={styles.toolbar}>
            <h2
              className={styles.rowTitle}
            >{`الأسئلة (${activity.questions.length.toString()})`}</h2>
            <Button
              iconStart={<Plus aria-hidden="true" />}
              onClick={() => {
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
