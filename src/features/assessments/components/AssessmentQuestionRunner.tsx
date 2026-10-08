import { ArrowLeft, Flag, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  AnswerTile,
  FeedbackMessage,
  QuestionProgress,
  type AnswerTileState,
} from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Card } from '@/components/ui/Card';
import { resolveMediaUrl } from '@/services/api/mediaUrl';

import { useSubmitAnswer } from '../api/assessmentMutations';
import { isAnswerable, needsSingleAnswerHint } from '../state/assessmentRun';
import type { AssessmentQuestion } from '../types';

import styles from './AssessmentQuestionRunner.module.css';

const ANSWER_CHOSEN = 'رائع! تم اختيار إجابتك';
const SINGLE_ANSWER_HINT = 'اختر إجابة واحدة.';

export interface AssessmentQuestionRunnerProps {
  assessmentId: string;
  questions: readonly AssessmentQuestion[];
  /** After the last question, with the number of answers the server accepted. */
  onFinished: (answered: number) => void;
}

function tileState(optionId: string, selected: string | null): AnswerTileState {
  if (selected === null) return 'idle';
  return optionId === selected ? 'selected' : 'dimmed';
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
}: AssessmentQuestionRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(0);
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
  const imageUrl = resolveMediaUrl(question.imageUrl);

  const advance = (answeredCount: number) => {
    if (isLast) {
      onFinished(answeredCount);
      return;
    }
    submit.reset();
    setSelected(null);
    setIndex(index + 1);
  };

  const sendAndAdvance = () => {
    if (!supported) {
      advance(answered);
      return;
    }
    if (selected === null) return;
    submit.mutate(
      { assessmentId, questionId: question.id, selectedOptionId: selected },
      {
        onSuccess: () => {
          const next = answered + 1;
          setAnswered(next);
          advance(next);
        },
      },
    );
  };

  return (
    <section className={styles.runner} aria-labelledby="assessment-section-title">
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h2 id="assessment-section-title" className={styles.title}>
            {question.sectionTitle ?? 'أسئلة التقييم'}
          </h2>
        </div>
      </div>

      <Card className={styles.card}>
        <QuestionProgress current={index + 1} total={total} />
        <p ref={promptRef} tabIndex={-1} className={styles.prompt}>
          {question.text}
        </p>
        {imageUrl ? <img className={styles.image} src={imageUrl} alt="" /> : null}

        {supported ? (
          <>
            {needsSingleAnswerHint(question) ? <p>{SINGLE_ANSWER_HINT}</p> : null}
            <div className={styles.answers} role="group" aria-label="الإجابات">
              {question.options.map((option) => (
                <AnswerTile
                  key={option.id}
                  label={option.text}
                  state={tileState(option.id, selected)}
                  disabled={submit.isPending}
                  onClick={() => {
                    setSelected(option.id);
                  }}
                />
              ))}
            </div>
            <FeedbackMessage kind={selected === null ? null : 'info'} text={ANSWER_CHOSEN} />
          </>
        ) : (
          <Alert tone="warning">
            لا يمكن الإجابة عن هذا السؤال: لم يُرسل الخادم خيارات له. يمكنك تخطّيه، لكن قد لا يقبل
            الخادم إنهاء التقييم قبل إصلاحه.
          </Alert>
        )}

        <ApiErrorAlert error={submit.error} />

        <div className={styles.actions}>
          <Button
            size="lg"
            disabled={supported && selected === null}
            isLoading={submit.isPending}
            iconStart={supported ? undefined : <SkipForward aria-hidden="true" />}
            iconEnd={isLast ? <Flag aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
            onClick={sendAndAdvance}
          >
            {supported ? (isLast ? 'إنهاء التقييم' : 'التالي') : 'تخطّي السؤال'}
          </Button>
        </div>
      </Card>
    </section>
  );
}
