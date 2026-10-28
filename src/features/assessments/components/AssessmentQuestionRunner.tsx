import { mediaKeys } from '@/services/media/localMedia';
import { ArrowLeft, ArrowRight, Flag, RotateCcw, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  AnswerTile,
  CHOICE_HINTS,
  FeedbackMessage,
  nextChoiceSelection,
  QuestionProgress,
  toChoiceAnswer,
  type AnswerTileState,
} from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Card } from '@/components/ui/Card';
import { ServerImage } from '@/components/shared/ServerImage';

import { useSubmitAnswer } from '../api/assessmentMutations';
import { isAnswerable } from '../state/assessmentRun';
import type { AssessmentQuestion } from '../types';

import styles from './AssessmentQuestionRunner.module.css';

const ANSWER_CHOSEN = 'رائع! تم اختيار إجابتك';

/** The questions a run went through: all of them (answered or skipped) and the answered ones. */
export interface RunProgress {
  processed: readonly string[];
  answered: readonly string[];
}

export interface AssessmentQuestionRunnerProps {
  assessmentId: string;
  questions: readonly AssessmentQuestion[];
  /** After the last question. */
  onFinished: (run: RunProgress) => void;
  /** Back to the category picker; the questions done so far stay done (answers are final). */
  onExit?: (run: RunProgress) => void;
  /** Label of the last question's button. */
  finishLabel?: string;
}

function tileState(optionId: string, selection: readonly string[]): AnswerTileState {
  return selection.includes(optionId) ? 'selected' : 'idle';
}

/**
 * Plays the server's questions in order. Answers are not marked right or wrong (assessment, not
 * a quiz). Each answer is sent on "التالي"; the next question only appears once the server
 * accepted it. Unsupported question types are shown honestly and can be skipped.
 */
export function AssessmentQuestionRunner({
  assessmentId,
  questions,
  onFinished,
  onExit,
  finishLabel = 'إنهاء التقييم',
}: AssessmentQuestionRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const [answered, setAnswered] = useState<readonly string[]>([]);
  const promptRef = useRef<HTMLParagraphElement>(null);
  const submit = useSubmitAnswer();

  const total = questions.length;
  const question = questions[index];
  const isLast = index === total - 1;

  useEffect(() => {
    if (index > 0) promptRef.current?.focus();
  }, [index]);

  if (!question) return null;
  const supported = isAnswerable(question);
  const { type } = question;
  const answer =
    type === null ? null : toChoiceAnswer(question.id, type, question.options.length, selection);

  const processedUpTo = (count: number) => questions.slice(0, count).map((item) => item.id);

  const advance = (answeredIds: readonly string[]) => {
    if (isLast) {
      onFinished({ processed: processedUpTo(total), answered: answeredIds });
      return;
    }
    submit.reset();
    setSelection([]);
    setIndex(index + 1);
  };

  const sendAndAdvance = () => {
    if (!supported) {
      advance(answered);
      return;
    }
    if (answer === null) return;
    submit.mutate(
      { assessmentId, answer },
      {
        onSuccess: () => {
          const next = [...answered, question.id];
          setAnswered(next);
          advance(next);
        },
      },
    );
  };

  let actionLabel = 'تخطّي السؤال';
  if (supported) actionLabel = isLast ? finishLabel : 'التالي';

  return (
    <section className={styles.runner} aria-labelledby="assessment-section-title">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 id="assessment-section-title" className={styles.title}>
            {question.sectionTitle ?? 'أسئلة التقييم'}
          </h2>
        </div>
        {onExit ? (
          <Button
            variant="ghost"
            size="sm"
            iconStart={<ArrowRight aria-hidden="true" />}
            disabled={submit.isPending}
            onClick={() => {
              onExit({ processed: processedUpTo(index), answered });
            }}
          >
            العودة إلى مقدمة التقييم
          </Button>
        ) : null}
      </div>

      <Card className={styles.card}>
        <QuestionProgress current={index + 1} total={total} />
        <p ref={promptRef} tabIndex={-1} className={styles.prompt}>
          {question.text}
        </p>
        <ServerImage
          path={question.imageUrl}
          mediaKey={mediaKeys.question(question.id)}
          alt=""
          className={styles.image}
        />

        {supported && type !== null ? (
          <>
            <p className={styles.hint}>{CHOICE_HINTS[type]}</p>
            <div className={styles.answers} role="group" aria-label="الإجابات">
              {question.options.map((option) => {
                const position = selection.indexOf(option.id);
                return (
                  <AnswerTile
                    key={option.id}
                    label={option.text}
                    imagePath={option.imageUrl}
                    imageKey={mediaKeys.option(option.id)}
                    badge={
                      type === 'Sequence' && position >= 0 ? (position + 1).toString() : undefined
                    }
                    state={tileState(option.id, selection)}
                    disabled={submit.isPending}
                    onClick={() => {
                      setSelection(nextChoiceSelection(type, selection, option.id));
                    }}
                  />
                );
              })}
            </div>
            {type === 'Sequence' && selection.length > 0 ? (
              <Button
                variant="outline"
                iconStart={<RotateCcw aria-hidden="true" />}
                disabled={submit.isPending}
                onClick={() => {
                  setSelection([]);
                }}
              >
                إعادة الترتيب
              </Button>
            ) : null}
            <FeedbackMessage kind={answer === null ? null : 'info'} text={ANSWER_CHOSEN} />
          </>
        ) : (
          <Alert tone="warning">
            لا يمكن الإجابة عن هذا السؤال: لم يُرسل الخادم خيارات له. يمكنك تخطّيه، لكن قد لا يقبل
            الخادم إنهاء التقييم قبل إصلاحه.
          </Alert>
        )}

        {question.isLocalContent ? (
          <Alert tone="info">
            تُعرض آخر خيارات محفوظة لهذا السؤال على هذا المتصفح، ويُتحقق من إجابتك عند الإرسال.
          </Alert>
        ) : null}
        <ApiErrorAlert error={submit.error} />

        <div className={styles.actions}>
          <Button
            size="lg"
            disabled={supported && answer === null}
            isLoading={submit.isPending}
            iconStart={supported ? undefined : <SkipForward aria-hidden="true" />}
            iconEnd={isLast ? <Flag aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            onClick={sendAndAdvance}
          >
            {actionLabel}
          </Button>
        </div>
      </Card>
    </section>
  );
}
