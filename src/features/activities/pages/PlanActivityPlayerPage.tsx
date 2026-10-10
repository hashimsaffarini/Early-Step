import { ArrowLeft, CircleCheck, FileQuestion, RotateCcw, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';

import {
  AnswerTile,
  PlayerShell,
  QuestionProgress,
  ResultPanel,
  type AnswerTileState,
} from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { resolveMediaUrl } from '@/services/api/mediaUrl';

import {
  usePlanActivityDetail,
  useSubmitPlanActivity,
  type PlanActivityDetail,
  type PlanAnswer,
  type PlanQuestion,
} from '../api/planActivityApi';

import styles from './TestPlayerPage.module.css';

const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'] as const;
const RESULT_STARS = 3;

const TYPE_HINTS: Record<NonNullable<PlanQuestion['type']>, string> = {
  SingleChoice: 'اختر إجابة واحدة.',
  MultiSelect: 'اختر كل الإجابات الصحيحة، ثم اضغط «التالي».',
  Sequence: 'اضغط على الخيارات بالترتيب الصحيح.',
};

function isPlayable(question: PlanQuestion): boolean {
  return question.type !== null && question.options.length > 0;
}

/** The answer for the current selection, or null while it is incomplete. */
function toAnswer(question: PlanQuestion, selection: readonly string[]): PlanAnswer | null {
  const [first] = selection;
  if (first === undefined) return null;
  if (question.type === 'SingleChoice') return { questionId: question.id, selectedOptionId: first };
  if (question.type === 'MultiSelect') {
    return { questionId: question.id, selectedOptionIds: [...selection] };
  }
  if (question.type === 'Sequence' && selection.length === question.options.length) {
    return { questionId: question.id, orderedOptionIds: [...selection] };
  }
  return null;
}

function tileState(selection: readonly string[], optionId: string): AnswerTileState {
  return selection.includes(optionId) ? 'selected' : 'idle';
}

interface RunProps {
  childId: string;
  detail: PlanActivityDetail;
  exitTo: string;
}

/**
 * Plays the plan activity and saves the answers once at the end
 * (`POST …/activities/{planActivityId}/submit`). The server hides correct answers, so the child
 * gets no right/wrong feedback; the specialist sees the saved counts in the plan.
 */
function PlanActivityRun({ childId, detail, exitTo }: RunProps) {
  const { questions } = detail;
  const submit = useSubmitPlanActivity(childId, detail.activity.id);
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const [answers, setAnswers] = useState<PlanAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (index > 0) questionRef.current?.focus();
  }, [index]);

  const question = questions[index];

  if (isFinished || !question) {
    if (submit.isSuccess) {
      return (
        <ResultPanel
          category="neutral"
          title="أحسنت! 👏"
          scoreText={`تم حفظ إجاباتك (${answers.length.toString()} من ${questions.length.toString()} أسئلة).`}
          stars={RESULT_STARS}
          maxStars={RESULT_STARS}
          actions={
            <Link to={exitTo} className={getButtonClassName({ size: 'lg' })}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      );
    }
    return (
      <Card className={styles.questionCard}>
        <ApiErrorAlert error={submit.error} />
        {submit.isPending ? <LoadingState label="جارٍ حفظ النتيجة…" /> : null}
        {submit.isError ? (
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
      </Card>
    );
  }

  const playable = isPlayable(question);
  const answer = toAnswer(question, selection);
  const imageUrl = resolveMediaUrl(question.imageUrl);
  const isLast = index === questions.length - 1;

  const choose = (optionId: string) => {
    if (question.type === 'SingleChoice') {
      setSelection([optionId]);
    } else if (question.type === 'MultiSelect') {
      setSelection((current) =>
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      );
    } else if (!selection.includes(optionId)) {
      setSelection((current) => [...current, optionId]);
    }
  };

  const next = () => {
    const nextAnswers = answer ? [...answers, answer] : answers;
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
      <QuestionProgress current={index + 1} total={questions.length} />
      <Card className={styles.questionCard}>
        <h2 className={styles.question} ref={questionRef} tabIndex={-1}>
          {question.text}
        </h2>
        {imageUrl ? <img src={imageUrl} alt="" className={styles.questionImage} /> : null}
        {question.type && playable ? <p>{TYPE_HINTS[question.type]}</p> : null}
      </Card>
      {playable ? (
        <ul className={styles.answers} aria-label="الإجابات">
          {question.options.map((option, optionIndex) => {
            const position = selection.indexOf(option.id);
            const badge =
              question.type === 'Sequence' && position >= 0
                ? (position + 1).toString()
                : OPTION_LETTERS[optionIndex];
            return (
              <li key={option.id}>
                <AnswerTile
                  label={option.text}
                  badge={badge}
                  state={tileState(selection, option.id)}
                  onClick={() => {
                    choose(option.id);
                  }}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState
          icon={<FileQuestion />}
          title="لا يمكن الإجابة عن هذا السؤال"
          description="نوع السؤال غير معروف أو لا توجد له خيارات. يمكنك تخطّيه."
        />
      )}
      {question.type === 'Sequence' && selection.length > 0 ? (
        <Button
          variant="outline"
          iconStart={<RotateCcw aria-hidden="true" />}
          onClick={() => {
            setSelection([]);
          }}
        >
          إعادة الترتيب
        </Button>
      ) : null}
      <Button
        size="lg"
        className={styles.next}
        disabled={playable && answer === null}
        iconEnd={playable ? <ArrowLeft aria-hidden="true" /> : <SkipForward aria-hidden="true" />}
        onClick={next}
      >
        {isLast ? 'إنهاء النشاط وحفظ النتيجة' : playable ? 'التالي' : 'تخطّي السؤال'}
      </Button>
    </>
  );
}

/** A child's training-plan activity, played from the server's questions; the result is saved. */
export function PlanActivityPlayerPage() {
  const { childId = '', activityId = '' } = useParams();
  const { paths } = useRoleArea();
  const query = usePlanActivityDetail(childId, activityId);
  const exitTo = paths.childProfile(childId);
  const activityTitle = query.data?.activity.title.trim();
  const title =
    activityTitle === undefined || activityTitle === '' ? 'نشاط من الخطة التدريبية' : activityTitle;
  const shell = { exitTo, exitLabel: 'خروج', title, category: 'neutral' as const, emoji: '📝' };
  const backLink = (
    <Link to={exitTo} className={getButtonClassName()}>
      العودة إلى ملف الطفل
    </Link>
  );

  if (query.isPending) {
    return (
      <PlayerShell {...shell}>
        <LoadingState />
      </PlayerShell>
    );
  }
  if (query.isError) {
    return (
      <PlayerShell {...shell}>
        <ErrorState
          title="تعذّر تحميل النشاط"
          description={query.error.message}
          action={backLink}
        />
      </PlayerShell>
    );
  }
  if (query.data.activity.isCompleted) {
    // One attempt per activity: the server rejects a second submission.
    return (
      <PlayerShell {...shell}>
        <EmptyState
          icon={<CircleCheck />}
          title="أُنجز هذا النشاط"
          description="حُفظت نتيجة هذا النشاط من قبل، ولا يمكن إرساله مرة أخرى."
          action={backLink}
        />
      </PlayerShell>
    );
  }
  if (query.data.questions.length === 0) {
    return (
      <PlayerShell {...shell}>
        <EmptyState
          icon={<FileQuestion />}
          title="لا تتوفر أسئلة لهذا النشاط"
          description="لم يُرسل الخادم أسئلة لهذا النشاط، لذلك لا يمكن تشغيله هنا حالياً."
          action={backLink}
        />
      </PlayerShell>
    );
  }
  return (
    <PlayerShell {...shell}>
      <PlanActivityRun childId={childId} detail={query.data} exitTo={exitTo} />
    </PlayerShell>
  );
}
