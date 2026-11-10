import { mediaKeys } from '@/services/media/localMedia';
import { CircleCheck, CircleX } from 'lucide-react';
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
 * loaded the first time the details are opened. Client revision 2026-11: one separated card per
 * question («السؤال n», type, the child's answer, the correct answer and a ✓ / ✕ chip with text —
 * never colour alone). The server sends the child's choices and a verdict per question, not the
 * correct answers: the correct answer is shown only when the verdict says the child's answer is
 * it (BACKEND_REQUESTS — correct options in the result).
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
        <ol className={styles.resultList} aria-label={`إجابات «${title}»`}>
          {query.data.questions.map((question, index) => {
            const type = toChoiceQuestionType(question.type);
            return (
              <li key={question.id} className={styles.resultItem}>
                <article aria-labelledby={`result-q-${question.id}`}>
                  <div className={styles.resultHead}>
                    <h4 id={`result-q-${question.id}`} className={styles.resultNumber}>
                      {`السؤال ${(index + 1).toString()}`}
                    </h4>
                    {type ? <Badge tone="neutral">{CHOICE_TYPE_LABELS[type]}</Badge> : null}
                    <ResultChip isCorrect={question.isCorrect} />
                  </div>
                  <p className={styles.itemTitle}>{question.text}</p>
                  {question.imageUrl || question.id ? (
                    <ServerImage
                      path={question.imageUrl}
                      mediaKey={mediaKeys.question(question.id)}
                      alt=""
                      className={styles.resultImage}
                    />
                  ) : null}
                  <div className={styles.answerBlock}>
                    <AnswerOptionList
                      label="إجابة الطفل"
                      options={question.selected}
                      isOrdered={type === 'Sequence'}
                    />
                  </div>
                  <div className={styles.answerBlock}>
                    {question.isCorrect === true ? (
                      <AnswerOptionList
                        label="الإجابة الصحيحة"
                        options={question.selected}
                        isOrdered={type === 'Sequence'}
                      />
                    ) : (
                      <p className={styles.meta}>
                        <span className={styles.answerLabel}>الإجابة الصحيحة: </span>
                        لا يرسلها الخادم حالياً.
                      </p>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      ) : null}
    </details>
  );
}

function ResultChip({ isCorrect }: { isCorrect: boolean | null }) {
  if (isCorrect === null) return null;
  return (
    <span className={isCorrect ? styles.chipCorrect : styles.chipWrong}>
      {isCorrect ? <CircleCheck aria-hidden="true" /> : <CircleX aria-hidden="true" />}
      {isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
    </span>
  );
}
