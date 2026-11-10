import { mediaKeys } from '@/services/media/localMedia';
import { ArrowLeft, Eye, FileQuestion, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';

import {
  DEFAULT_REAL_GAME,
  difficultyForAge,
  GAME_TEMPLATES,
  REAL_GAMES,
  RealGameSession,
  resolveGameTemplate,
  resolveRealGame,
  type GameQuestion,
} from '@/components/games';
import {
  AnswerTile,
  CHOICE_HINTS,
  nextChoiceSelection,
  PlayerShell,
  QuestionProgress,
  ResultPanel,
  toChoiceAnswer,
  type AnswerTileState,
} from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import { ServerImage } from '@/components/shared/ServerImage';
import type { AppError } from '@/services/http/apiError';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import {
  usePlanActivityDetail,
  useSubmitPlanActivity,
  type PlanActivityDetail,
  type PlanAnswer,
  type PlanQuestion,
} from '../api/planActivityApi';
import { PlanGameRun } from '../components/PlanGameRun';

import styles from './TestPlayerPage.module.css';

const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'] as const;

/** The server rejects a submission unless every question is answered (live 2026-10-14). */
function isPlayable(question: PlanQuestion): boolean {
  return question.type !== null && question.options.length > 0;
}

/** 400 / 409 are final answers from the server (e.g. already submitted); retry only others. */
function isRetryable(error: AppError): boolean {
  return error.status === undefined || error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

function lastLabel(isLast: boolean, isPractice: boolean): string {
  if (!isLast) return 'التالي';
  return isPractice ? 'إنهاء المحاولة' : 'إنهاء النشاط وحفظ النتيجة';
}

function tileState(selection: readonly string[], optionId: string): AnswerTileState {
  return selection.includes(optionId) ? 'selected' : 'idle';
}

interface RunProps {
  childId: string;
  detail: PlanActivityDetail;
  exitTo: string;
  /**
   * Reopened after a saved result (client revision 2026-11: training-plan activities stay
   * openable). The server keeps one result per activity (a second submit → 409), so a practice
   * run is never submitted and the saved result stays untouched.
   */
  isPractice?: boolean;
  onRestart?: () => void;
}

/**
 * Plays the plan activity and saves the answers once at the end
 * (`POST …/activities/{planActivityId}/submit`). The server hides correct answers from the child
 * and the parent cannot read the result (403), so the child gets no right/wrong feedback; the
 * specialist sees the score and per-question result.
 */
function PlanActivityRun({ childId, detail, exitTo, isPractice = false, onRestart }: RunProps) {
  const restartLabel = 'إعادة المحاولة';
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
    if (isPractice) {
      return (
        <ResultPanel
          category="neutral"
          title="أحسنت! انتهت المحاولة 👏"
          scoreText="هذه محاولة للتدريب: تبقى النتيجة المحفوظة سابقاً كما هي."
          actions={
            <>
              <Button size="lg" iconStart={<RotateCcw aria-hidden="true" />} onClick={onRestart}>
                {restartLabel}
              </Button>
              <Link to={exitTo} className={getButtonClassName({ variant: 'outline', size: 'lg' })}>
                العودة إلى ملف الطفل
              </Link>
            </>
          }
        />
      );
    }
    if (submit.isSuccess) {
      return (
        <ResultPanel
          category="neutral"
          title="أحسنت! 👏"
          scoreText={`تم حفظ إجاباتك (${answers.length.toString()} من ${questions.length.toString()} أسئلة).`}
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
      </Card>
    );
  }

  const { type } = question;
  if (type === null) return null;
  const answer = toChoiceAnswer(question.id, type, question.options.length, selection);
  const isLast = index === questions.length - 1;

  const next = () => {
    if (!answer) return;
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setSelection([]);
    if (isLast) {
      setIsFinished(true);
      if (!isPractice) submit.mutate(nextAnswers);
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
        <ServerImage
          path={question.imageUrl}
          mediaKey={mediaKeys.question(question.id)}
          alt=""
          className={styles.questionImage}
        />
        <p className={styles.hint}>{CHOICE_HINTS[type]}</p>
      </Card>
      <ul className={styles.answers} aria-label="الإجابات">
        {question.options.map((option, optionIndex) => {
          const position = selection.indexOf(option.id);
          const badge =
            type === 'Sequence' && position >= 0
              ? (position + 1).toString()
              : OPTION_LETTERS[optionIndex];
          return (
            <li key={option.id}>
              <AnswerTile
                label={option.text}
                imagePath={option.imageUrl}
                imageKey={mediaKeys.option(option.id)}
                badge={badge}
                state={tileState(selection, option.id)}
                onClick={() => {
                  setSelection(nextChoiceSelection(type, selection, option.id));
                }}
              />
            </li>
          );
        })}
      </ul>
      {type === 'Sequence' && selection.length > 0 ? (
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
        disabled={answer === null}
        iconEnd={<ArrowLeft aria-hidden="true" />}
        onClick={next}
      >
        {lastLabel(isLast, isPractice)}
      </Button>
    </>
  );
}

/** Every question has a known type here (`isPlayable` was checked before). */
function toGameQuestions(questions: readonly PlanQuestion[]): GameQuestion[] {
  return questions.flatMap((question) =>
    question.type === null ? [] : [{ ...question, type: question.type }],
  );
}

/**
 * A child's training-plan activity, played from the server's questions; the result is saved.
 * Routing (client revisions 2026-10 / 2026-11):
 * - a game whose `slug` names one of the five real games opens that game (`components/games/real`),
 *   as does a game with no usable slug and no questions; real games are always replayable and are
 *   never submitted (no backend contract stores their result — BACKEND_REQUESTS);
 * - other games open their legacy template engine (unknown slug with questions → visual search);
 * - tests use the generic player;
 * - an activity that already has a saved result reopens as a practice run that is not submitted
 *   (one result per activity on the server; a second submit → 409);
 * - the Teacher reviews results on the child page and does not play the child's activities.
 */
export function PlanActivityPlayerPage() {
  const { childId = '', activityId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const isTeacher = role === 'Teacher';
  const query = usePlanActivityDetail(isTeacher ? '' : childId, activityId);
  const children = useChildrenForRole(role);
  const childAge = children.data?.find((item) => item.id === childId)?.age ?? null;
  // "Already done" is decided on the first load: after this session's submission the refetched
  // activity is completed, but the run (and its result screen) stays on screen.
  const [completedOnLoad, setCompletedOnLoad] = useState<boolean | null>(null);
  const [practiceRun, setPracticeRun] = useState(0);
  if (query.data && completedOnLoad === null) {
    setCompletedOnLoad(query.data.activity.isCompleted);
  }
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
  const restartPractice = () => {
    setPracticeRun((value) => value + 1);
  };

  if (isTeacher) {
    return (
      <PlayerShell {...shell}>
        <EmptyState
          icon={<Eye />}
          title="عرض النتيجة من ملف الطفل"
          description="يلعب الطفل أنشطته من حساب وليّ الأمر. يمكنك مراجعة النتيجة وإجابات الطفل من ملف الطفل."
          action={backLink}
        />
      </PlayerShell>
    );
  }
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
          action={
            query.error.status === HTTP_STATUS.NOT_FOUND ? (
              backLink
            ) : (
              <>
                <Button variant="outline" onClick={() => void query.refetch()}>
                  إعادة المحاولة
                </Button>
                {backLink}
              </>
            )
          }
        />
      </PlayerShell>
    );
  }
  const { activity, questions } = query.data;
  if (activity.type === 'game') {
    const realGame =
      resolveRealGame(activity.slug) ??
      (resolveGameTemplate(activity.slug) === null && questions.length === 0
        ? REAL_GAMES[DEFAULT_REAL_GAME]
        : null);
    if (realGame) {
      return (
        <PlayerShell {...shell} emoji={realGame.emoji} width="wide">
          <RealGameSession
            game={realGame}
            initialDifficulty={difficultyForAge(childAge)}
            exitTo={exitTo}
            exitLabel="العودة إلى ملف الطفل"
          />
        </PlayerShell>
      );
    }
  }
  if (!questions.every(isPlayable)) {
    return (
      <PlayerShell {...shell}>
        <EmptyState
          icon={<FileQuestion />}
          title="لا يمكن تشغيل هذا النشاط حالياً"
          description="أحد أسئلة هذا النشاط بلا خيارات أو من نوع غير معروف، والخادم لا يحفظ النتيجة إلا بعد الإجابة عن كل الأسئلة."
          action={backLink}
        />
      </PlayerShell>
    );
  }
  if (questions.length === 0) {
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
  const isPractice = completedOnLoad ?? activity.isCompleted;
  const practiceNotice = isPractice ? (
    <p className={styles.practiceNotice} role="note">
      حُفظت نتيجة هذا النشاط من قبل. هذه محاولة للتدريب ولن تُرسل مرة أخرى.
    </p>
  ) : null;
  const template =
    activity.type === 'game'
      ? (resolveGameTemplate(activity.slug) ?? GAME_TEMPLATES['spot-it'])
      : null;
  if (template) {
    return (
      <PlayerShell {...shell} emoji="🎮" width="wide">
        {practiceNotice}
        <PlanGameRun
          key={practiceRun}
          childId={childId}
          activity={activity}
          savedActivity={activity}
          template={template}
          questions={toGameQuestions(questions)}
          exitTo={exitTo}
          isPractice={isPractice}
          onRestart={restartPractice}
        />
      </PlayerShell>
    );
  }
  return (
    <PlayerShell {...shell}>
      {practiceNotice}
      <PlanActivityRun
        key={practiceRun}
        childId={childId}
        detail={query.data}
        exitTo={exitTo}
        isPractice={isPractice}
        onRestart={restartPractice}
      />
    </PlayerShell>
  );
}
