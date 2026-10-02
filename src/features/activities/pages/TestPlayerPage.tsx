import { ArrowLeft, FileQuestion, RotateCcw, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';

import {
  AnswerTile,
  Confetti,
  FeedbackMessage,
  PlayerShell,
  QuestionProgress,
  ResultPanel,
  SoundToggle,
  StatPill,
  starsForScore,
  useSoundEffects,
  type AnswerTileState,
} from '@/components/players';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useRoleArea } from '@/hooks/useRoleArea';
import { cx } from '@/utils/classNames';

import { QuestionPrompt } from '../components/QuestionPrompt';
import { findTest, type TestDefinition } from '../data/tests';

import styles from './TestPlayerPage.module.css';

const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د'] as const;
const RESULT_STARS = 3;
const EXCELLENT_RATIO = 0.8;
const GOOD_RATIO = 0.5;

function resultTitle(correct: number, total: number): string {
  const ratio = total > 0 ? correct / total : 0;
  if (ratio >= EXCELLENT_RATIO) return 'ممتاز! أداء رائع 🎉';
  if (ratio >= GOOD_RATIO) return 'أحسنت! 👍';
  return 'محاولة جميلة! 💪';
}

function tileState(index: number, correctIndex: number, picked: number | null): AnswerTileState {
  if (picked === null) return 'idle';
  if (index === correctIndex) return 'correct';
  if (index === picked) return 'wrong';
  return 'dimmed';
}

interface TestRunProps {
  test: TestDefinition;
}

/** One run through a test: question → pick → feedback → "التالي" → … → result. */
function TestRun({ test }: TestRunProps) {
  const { paths } = useRoleArea();
  const sound = useSoundEffects();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  const total = test.questions.length;
  const question = test.questions[index];

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    questionRef.current?.focus();
  }, [index]);

  useEffect(() => {
    if (picked !== null) nextRef.current?.focus();
  }, [picked]);

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setIsFinished(false);
  };

  const end = (
    <>
      <StatPill icon={Zap} tone="accent">{`النقاط: ${score.toString()}`}</StatPill>
      <SoundToggle isMuted={sound.isMuted} onToggle={sound.toggleMuted} />
    </>
  );

  const shell = {
    exitTo: paths.tests,
    title: test.title,
    category: test.category,
    emoji: test.emoji,
    end,
  };

  if (isFinished || !question) {
    return (
      <PlayerShell {...shell}>
        <Confetti />
        <ResultPanel
          category={test.category}
          title={resultTitle(score, total)}
          scoreText={`${score.toString()} من ${total.toString()} إجابات صحيحة`}
          stars={starsForScore(score, total, RESULT_STARS)}
          maxStars={RESULT_STARS}
          actions={
            <>
              <Button size="lg" iconStart={<RotateCcw aria-hidden="true" />} onClick={restart}>
                أعد الاختبار
              </Button>
              <Link
                to={paths.tests}
                className={getButtonClassName({ variant: 'outline', size: 'lg' })}
              >
                العودة للاختبارات
              </Link>
            </>
          }
        />
      </PlayerShell>
    );
  }

  const correctOption = question.options[question.correctIndex];
  const isCorrect = picked === question.correctIndex;
  const isLast = index === total - 1;

  const pick = (optionIndex: number) => {
    if (picked !== null) return;
    setPicked(optionIndex);
    const right = optionIndex === question.correctIndex;
    if (right) setScore((value) => value + 1);
    sound.play(right ? 'correct' : 'wrong');
  };

  const next = () => {
    if (isLast) {
      sound.play('win');
      setIsFinished(true);
      return;
    }
    setPicked(null);
    setIndex((value) => value + 1);
  };

  let feedbackText: string | undefined;
  if (picked !== null && !isCorrect && correctOption) {
    feedbackText = `الإجابة الصحيحة هي «${correctOption.label}»`;
  }

  return (
    <PlayerShell {...shell}>
      <QuestionProgress current={index + 1} total={total} />
      <span className={styles.questionPill}>{`السؤال ${(index + 1).toString()}`}</span>
      <Card className={styles.questionCard}>
        <h2 className={styles.question} ref={questionRef} tabIndex={-1}>
          <QuestionPrompt parts={question.prompt} />
        </h2>
      </Card>
      <ul className={styles.answers} aria-label="الإجابات">
        {question.options.map((option, optionIndex) => (
          <li key={option.label}>
            <AnswerTile
              label={option.label}
              emoji={option.emoji}
              badge={OPTION_LETTERS[optionIndex]}
              state={tileState(optionIndex, question.correctIndex, picked)}
              disabled={picked !== null}
              onClick={() => {
                pick(optionIndex);
              }}
            />
          </li>
        ))}
      </ul>
      <FeedbackMessage
        kind={picked === null ? null : isCorrect ? 'correct' : 'wrong'}
        text={feedbackText}
      />
      {picked !== null ? (
        <button
          ref={nextRef}
          type="button"
          className={cx(getButtonClassName({ size: 'lg' }), styles.next)}
          onClick={next}
        >
          {isLast ? 'عرض النتيجة' : 'التالي'}
          <ArrowLeft aria-hidden="true" />
        </button>
      ) : null}
    </PlayerShell>
  );
}

/** Full-screen test player (Replit `/tests/:id/play`), light style. UI only — no results saved. */
export function TestPlayerPage() {
  const { testId } = useParams();
  const { paths } = useRoleArea();
  const test = findTest(testId);

  if (!test) {
    return (
      <PlayerShell exitTo={paths.tests} title="الاختبار غير موجود" category="neutral" emoji="📝">
        <EmptyState
          icon={<FileQuestion />}
          title="لم يتم العثور على الاختبار"
          description="قد يكون الرابط غير صحيح أو أن الاختبار غير متاح."
          action={
            <Link to={paths.tests} className={getButtonClassName()}>
              العودة للاختبارات
            </Link>
          }
        />
      </PlayerShell>
    );
  }

  return <TestRun key={test.id} test={test} />;
}
