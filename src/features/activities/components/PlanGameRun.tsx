import { ArrowLeft, Flag, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker } from 'react-router';

import { GameChallenge, GameStage, type GameQuestion, type GameTemplate } from '@/components/games';
import { ResultPanel, toChoiceAnswer } from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { PlanActivity } from '@/services/api/childPlan';
import type { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import { useSubmitPlanActivity, type PlanAnswer } from '../api/planActivityApi';

export interface PlanGameRunProps {
  childId: string;
  /** The plan activity as first loaded (its `id` is the planActivityId used to submit). */
  activity: PlanActivity;
  /** The activity as the server returns it now (after the submission: its saved result). */
  savedActivity: PlanActivity;
  template: GameTemplate;
  questions: readonly GameQuestion[];
  exitTo: string;
}

/** 400 / 409 are final answers from the server (e.g. already submitted); retry only others. */
function isRetryable(error: AppError): boolean {
  return error.status === undefined || error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

/** The saved result line, only with what the server returned for this role. */
function savedResultText(activity: PlanActivity, answered: number, total: number): string {
  const parts: string[] = [];
  if (activity.score !== null) parts.push(`النتيجة: ${activity.score.toString()}%`);
  if (activity.correctAnswers !== null) {
    parts.push(`إجابات صحيحة: ${activity.correctAnswers.toString()}`);
  }
  if (activity.wrongAnswers !== null) {
    parts.push(`إجابات غير صحيحة: ${activity.wrongAnswers.toString()}`);
  }
  if (parts.length > 0) return parts.join(' · ');
  return `تم حفظ إجاباتك (${answered.toString()} من ${total.toString()} أسئلة).`;
}

/**
 * Plays a game activity with its template's engine over the activity's REAL questions. Each
 * challenge's selection becomes the existing answer format (`toChoiceAnswer`: `selectedOptionId` /
 * `selectedOptionIds` / `orderedOptionIds`); all answers are sent ONCE at the end through
 * `POST TrainingPlan/children/{childId}/activities/{planActivityId}/submit`. Nothing is scored or
 * stored locally; leaving before the submission asks first.
 */
export function PlanGameRun({
  childId,
  activity,
  savedActivity,
  template,
  questions,
  exitTo,
}: PlanGameRunProps) {
  const submit = useSubmitPlanActivity(childId, activity.id);
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const [answers, setAnswers] = useState<PlanAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const promptRef = useRef<HTMLHeadingElement>(null);

  const hasUnsavedWork = !submit.isSuccess && (answers.length > 0 || selection.length > 0);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedWork && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!hasUnsavedWork) return undefined;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [hasUnsavedWork]);

  useEffect(() => {
    if (index > 0) promptRef.current?.focus();
  }, [index]);

  const leaveDialog = (
    <ConfirmDialog
      isOpen={blocker.state === 'blocked'}
      title="مغادرة اللعبة؟"
      description="لم تُحفظ إجابات هذه اللعبة بعد. إذا غادرت الآن ستضيع إجاباتك."
      confirmLabel="مغادرة"
      tone="danger"
      onConfirm={() => {
        blocker.proceed?.();
      }}
      onCancel={() => {
        blocker.reset?.();
      }}
    />
  );

  const question = questions[index];
  if (isFinished || !question) {
    if (submit.isSuccess) {
      return (
        <ResultPanel
          category="neutral"
          title={`أحسنت! أنهيت «${template.name}» 🎉`}
          scoreText={savedResultText(savedActivity, answers.length, questions.length)}
          actions={
            <Link to={exitTo} className={getButtonClassName({ size: 'lg' })}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      );
    }
    return (
      <Card>
        <ApiErrorAlert error={submit.error} />
        {submit.isPending ? <LoadingState label="جارٍ حفظ النتيجة…" /> : null}
        {submit.isError && isRetryable(submit.error) ? (
          <Button
            size="lg"
            iconStart={<RotateCcw aria-hidden="true" />}
            onClick={() => {
              submit.mutate(answers);
            }}
          >
            إعادة محاولة الحفظ
          </Button>
        ) : null}
        {submit.isError && !isRetryable(submit.error) ? (
          <Link to={exitTo} className={getButtonClassName()}>
            العودة إلى ملف الطفل
          </Link>
        ) : null}
        {leaveDialog}
      </Card>
    );
  }

  const answer = toChoiceAnswer(question.id, question.type, question.options.length, selection);
  const isLast = index === questions.length - 1;

  const next = () => {
    if (!answer || submit.isPending) return;
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setSelection([]);
    if (isLast) {
      setIsFinished(true);
      submit.mutate(nextAnswers);
      return;
    }
    setIndex((value) => value + 1);
  };

  return (
    <>
      <GameStage
        key={question.id}
        template={template}
        question={question}
        index={index}
        total={questions.length}
        promptRef={promptRef}
        footer={
          <Button
            size="lg"
            disabled={answer === null}
            iconEnd={isLast ? <Flag aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            onClick={next}
          >
            {isLast ? 'إنهاء اللعبة وحفظ النتيجة' : 'التالي'}
          </Button>
        }
      >
        <GameChallenge
          template={template}
          question={question}
          selection={selection}
          onSelectionChange={setSelection}
        />
      </GameStage>
      {leaveDialog}
    </>
  );
}
