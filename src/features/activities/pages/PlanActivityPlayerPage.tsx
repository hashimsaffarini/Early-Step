import { ArrowLeft, FileQuestion, RotateCcw, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';

import {
  AnswerTile,
  FeedbackMessage,
  PlayerShell,
  QuestionProgress,
  ResultPanel,
  starsForScore,
  type AnswerTileState,
  type FeedbackKind,
} from '@/components/players';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { useRoleArea } from '@/hooks/useRoleArea';
import { resolveMediaUrl } from '@/services/api/mediaUrl';

import {
  usePlanActivityDetail,
  type PlanActivityDetail,
  type PlanQuestion,
} from '../api/planActivityApi';

import styles from './TestPlayerPage.module.css';

const NOT_SAVED = 'لن تُحفظ النتيجة — الخادم لا يدعم حفظ نتائج الأنشطة بعد.';
const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'] as const;
const RESULT_STARS = 3;

function hasCorrectness(question: PlanQuestion): boolean {
  return question.options.some((option) => option.isCorrect !== null);
}

function tileState(
  question: PlanQuestion,
  optionId: string,
  picked: string | null,
): AnswerTileState {
  if (picked === null) return 'idle';
  const option = question.options.find((item) => item.id === optionId);
  if (!hasCorrectness(question)) return optionId === picked ? 'selected' : 'dimmed';
  if (option?.isCorrect) return 'correct';
  return optionId === picked ? 'wrong' : 'dimmed';
}

function feedbackKind(question: PlanQuestion, picked: string | null): FeedbackKind | null {
  if (picked === null) return null;
  if (!hasCorrectness(question)) return 'info';
  return question.options.find((option) => option.id === picked)?.isCorrect ? 'correct' : 'wrong';
}

interface RunProps {
  detail: PlanActivityDetail;
  exitTo: string;
}

/** Local play only: answers are never sent (no results endpoint). */
function PlanActivityRun({ detail, exitTo }: RunProps) {
  const { questions } = detail;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [scored, setScored] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (index > 0) questionRef.current?.focus();
  }, [index]);

  const total = questions.length;
  const question = questions[index];

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setScored(0);
    setIsFinished(false);
  };

  if (isFinished || !question) {
    const scoreText =
      scored > 0
        ? `${correct.toString()} من ${scored.toString()} إجابات صحيحة`
        : 'أنهيت أسئلة النشاط';
    return (
      <>
        <Alert tone="info">{NOT_SAVED}</Alert>
        <ResultPanel
          category="neutral"
          title="أحسنت! 👏"
          scoreText={scoreText}
          stars={scored > 0 ? starsForScore(correct, scored, RESULT_STARS) : RESULT_STARS}
          maxStars={RESULT_STARS}
          actions={
            <>
              <Button size="lg" iconStart={<RotateCcw aria-hidden="true" />} onClick={restart}>
                العب مرة أخرى
              </Button>
              <Link to={exitTo} className={getButtonClassName({ variant: 'outline', size: 'lg' })}>
                العودة إلى ملف الطفل
              </Link>
            </>
          }
        />
      </>
    );
  }

  const playable = question.isSingleChoice && question.options.length > 0;
  const imageUrl = resolveMediaUrl(question.imageUrl);
  const isLast = index === total - 1;

  const pick = (optionId: string) => {
    if (picked !== null) return;
    setPicked(optionId);
    if (hasCorrectness(question)) {
      setScored((value) => value + 1);
      if (question.options.find((option) => option.id === optionId)?.isCorrect) {
        setCorrect((value) => value + 1);
      }
    }
  };

  const next = () => {
    if (isLast) {
      setIsFinished(true);
      return;
    }
    setPicked(null);
    setIndex((value) => value + 1);
  };

  return (
    <>
      <Alert tone="info">{NOT_SAVED}</Alert>
      <QuestionProgress current={index + 1} total={total} />
      <Card className={styles.questionCard}>
        <h2 className={styles.question} ref={questionRef} tabIndex={-1}>
          {question.text}
        </h2>
        {imageUrl ? <img src={imageUrl} alt="" className={styles.questionImage} /> : null}
      </Card>
      {playable ? (
        <>
          <ul className={styles.answers} aria-label="الإجابات">
            {question.options.map((option, optionIndex) => (
              <li key={option.id}>
                <AnswerTile
                  label={option.text}
                  badge={OPTION_LETTERS[optionIndex]}
                  state={tileState(question, option.id, picked)}
                  disabled={picked !== null}
                  onClick={() => {
                    pick(option.id);
                  }}
                />
              </li>
            ))}
          </ul>
          <FeedbackMessage
            kind={feedbackKind(question, picked)}
            text={hasCorrectness(question) ? undefined : 'تم اختيار إجابتك'}
          />
        </>
      ) : (
        <Alert tone="warning">هذا النوع من الأسئلة غير مدعوم بعد في المشغّل. يمكنك تخطّيه.</Alert>
      )}
      {picked !== null || !playable ? (
        <Button
          size="lg"
          className={styles.next}
          iconEnd={playable ? <ArrowLeft aria-hidden="true" /> : <SkipForward aria-hidden="true" />}
          onClick={next}
        >
          {isLast ? 'إنهاء النشاط' : playable ? 'التالي' : 'تخطّي السؤال'}
        </Button>
      ) : null}
    </>
  );
}

/** A child's training-plan activity, played from the server's questions (results not saved). */
export function PlanActivityPlayerPage() {
  const { childId = '', activityId = '' } = useParams();
  const { paths } = useRoleArea();
  const query = usePlanActivityDetail(childId, activityId);
  const exitTo = paths.childProfile(childId);
  const activityTitle = query.data?.activity.title.trim();
  const title =
    activityTitle === undefined || activityTitle === '' ? 'نشاط من الخطة التدريبية' : activityTitle;
  const shell = { exitTo, exitLabel: 'خروج', title, category: 'neutral' as const, emoji: '📝' };

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
            <Link to={exitTo} className={getButtonClassName()}>
              العودة إلى ملف الطفل
            </Link>
          }
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
          action={
            <Link to={exitTo} className={getButtonClassName()}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      </PlayerShell>
    );
  }
  return (
    <PlayerShell {...shell}>
      <PlanActivityRun detail={query.data} exitTo={exitTo} />
    </PlayerShell>
  );
}
