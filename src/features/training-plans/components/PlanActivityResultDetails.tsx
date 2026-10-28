import { mediaKeys } from '@/services/media/localMedia';
import { useState } from 'react';

import { CHOICE_TYPE_LABELS, toChoiceQuestionType } from '@/components/players';
import { AnswerOptionList } from '@/components/shared/AnswerOptionList';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { ServerImage } from '@/components/shared/ServerImage';
import { Badge } from '@/components/ui/Badge';
import { HTTP_STATUS } from '@/services/http/httpStatus';
import { Spinner } from '@/components/ui/Feedback';

import { usePlanActivityResult } from '../api/trainingPlansQueries';

import styles from './plans.module.css';

export interface PlanActivityResultDetailsProps {
  childId: string;
  planActivityId: string;
  title: string;
  initiallyOpen?: boolean;
}

/**
 * The child's answers to a submitted activity (`GET …/{planActivityId}/result`, Specialist only),
 * loaded the first time the specialist opens the details. The server sends the child's choices and
 * a verdict per question, not the correct answers.
 */
export function PlanActivityResultDetails({
  childId,
  planActivityId,
  title,
  initiallyOpen = false,
}: PlanActivityResultDetailsProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const query = usePlanActivityResult(childId, planActivityId, isOpen);

  return (
    <details
      className={styles.result}
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary>عرض إجابات الطفل</summary>
      {query.isPending && isOpen ? <Spinner label="جارٍ تحميل النتيجة…" /> : null}
      {query.error?.status === HTTP_STATUS.FORBIDDEN ? (
        <p className={styles.meta}>
          تفاصيل الإجابات متاحة للأخصائي المتابع للطفل. يمكنك متابعة حالة الأنشطة وإرسال ملاحظاتك
          له.
        </p>
      ) : (
        <ApiErrorAlert error={query.error} onRetry={() => void query.refetch()} />
      )}
      {query.data?.questions.length === 0 ? (
        <p className={styles.meta}>لم يُرسل الخادم تفاصيل الأسئلة لهذا النشاط.</p>
      ) : null}
      {query.data && query.data.questions.length > 0 ? (
        <ul className={styles.resultList} aria-label={`إجابات «${title}»`}>
          {query.data.questions.map((question) => {
            const type = toChoiceQuestionType(question.type);
            return (
              <li key={question.id} className={styles.resultItem}>
                <div className={styles.resultHead}>
                  <span className={styles.itemTitle}>{question.text}</span>
                  {question.isCorrect === null ? null : (
                    <Badge tone={question.isCorrect ? 'success' : 'warning'} hasDot>
                      {question.isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
                    </Badge>
                  )}
                </div>
                {question.imageUrl || question.id ? (
                  <ServerImage
                    path={question.imageUrl}
                    mediaKey={mediaKeys.question(question.id)}
                    alt=""
                    className={styles.resultImage}
                  />
                ) : null}
                {type ? <p className={styles.meta}>{CHOICE_TYPE_LABELS[type]}</p> : null}
                <AnswerOptionList
                  label="إجابة الطفل"
                  options={question.selected}
                  isOrdered={type === 'Sequence'}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </details>
  );
}
