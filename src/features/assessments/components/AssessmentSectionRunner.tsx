import { ArrowLeft, ArrowRight, Eye, Flag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  FeedbackMessage,
  QuestionProgress,
  AnswerTile,
  type AnswerTileState,
} from '@/components/players';
import { CategoryTile, getCategoryGradientClass } from '@/components/shared/CategoryTile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import type { AssessmentQuestion, AssessmentSection } from '../types';

import styles from './AssessmentSectionRunner.module.css';

const ANSWER_SAVED = 'رائع! تم اختيار إجابتك';

export interface AssessmentSectionRunnerProps {
  section: AssessmentSection;
  /** Called after the last question with the number of questions answered. */
  onFinish: (answered: number) => void;
  onExit: () => void;
}

function tileState(index: number, selected: number | null): AnswerTileState {
  if (selected === null) return 'idle';
  return index === selected ? 'selected' : 'dimmed';
}

function Stimulus({ question, className }: { question: AssessmentQuestion; className: string }) {
  const { value, kind = 'text' } = question.stimulus;
  return (
    <div className={cx(styles.stimulus, className)}>
      {kind === 'expression' ? <bdi dir="ltr">{value}</bdi> : <span>{value}</span>}
    </div>
  );
}

/**
 * Plays one assessment section. Answers are not marked right or wrong (it is an assessment,
 * not a quiz): the chosen tile is highlighted, then the child moves on with "التالي".
 * No countdown timers.
 */
export function AssessmentSectionRunner({
  section,
  onFinish,
  onExit,
}: AssessmentSectionRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const promptRef = useRef<HTMLParagraphElement>(null);

  const total = section.questions.length;
  const question = section.questions[index];
  const isLast = index === total - 1;
  const showMemory = question?.memorize !== undefined && isMemorizing;

  useEffect(() => {
    if (index > 0) promptRef.current?.focus();
  }, [index]);

  if (!question) return null;

  const goNext = () => {
    if (isLast) {
      onFinish(total);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setIsMemorizing(true);
  };

  const gradient = getCategoryGradientClass(section.category);

  return (
    <section className={styles.runner} aria-labelledby="section-title">
      <div className={styles.header}>
        <CategoryTile category={section.category} emoji={section.emoji} shape="round" />
        <div className={styles.headerText}>
          <h2 id="section-title" className={styles.title}>
            {section.title}
          </h2>
          <p className={styles.subtitle}>{section.subtitle}</p>
        </div>
        <Button variant="ghost" iconStart={<ArrowRight aria-hidden="true" />} onClick={onExit}>
          الأقسام
        </Button>
      </div>

      <Card className={styles.card}>
        <QuestionProgress current={index + 1} total={total} />

        {showMemory ? (
          <>
            <p ref={promptRef} tabIndex={-1} className={styles.prompt}>
              تذكّر هذه الصور جيداً
            </p>
            <p className={styles.memoryIntro}>انظر إليها، وعندما تكون جاهزاً اضغط «أنا جاهز».</p>
            <ul className={styles.memoryItems} aria-label="صور للتذكّر">
              {question.memorize?.map((item) => (
                <li key={item.label} className={styles.memoryItem}>
                  <span className={styles.memoryEmoji} aria-hidden="true">
                    {item.emoji}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
            <div className={styles.actions}>
              <Button
                size="lg"
                onClick={() => {
                  setIsMemorizing(false);
                }}
              >
                أنا جاهز
              </Button>
            </div>
          </>
        ) : (
          <>
            <p ref={promptRef} tabIndex={-1} className={styles.prompt}>
              {question.prompt}
            </p>
            <Stimulus question={question} className={gradient} />
            <div className={styles.answers} role="group" aria-label="الإجابات">
              {question.options.map((option, optionIndex) => (
                <AnswerTile
                  key={option.label}
                  label={option.label}
                  emoji={option.emoji}
                  state={tileState(optionIndex, selected)}
                  disabled={selected !== null}
                  onClick={() => {
                    setSelected(optionIndex);
                  }}
                />
              ))}
            </div>
            <FeedbackMessage kind={selected === null ? null : 'info'} text={ANSWER_SAVED} />
            <div className={styles.actions}>
              {question.memorize && selected === null ? (
                <Button
                  variant="outline"
                  size="lg"
                  iconStart={<Eye aria-hidden="true" />}
                  onClick={() => {
                    setIsMemorizing(true);
                  }}
                >
                  أرني مرة أخرى
                </Button>
              ) : null}
              <Button
                size="lg"
                disabled={selected === null}
                iconEnd={isLast ? <Flag aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
                onClick={goNext}
              >
                {isLast ? 'إنهاء القسم' : 'التالي'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
