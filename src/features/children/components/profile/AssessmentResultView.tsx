import { Info } from 'lucide-react';

import { CHOICE_TYPE_LABELS, toChoiceQuestionType } from '@/components/players';
import { AnswerOptionList } from '@/components/shared/AnswerOptionList';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Feedback';
import type {
  AssessmentResult,
  AssessmentResultCategory,
  AssessmentResultQuestion,
} from '@/services/api/assessmentResult';

import styles from './profile.module.css';

function QuestionRow({ question }: { question: AssessmentResultQuestion }) {
  const type = toChoiceQuestionType(question.type);
  const isOrdered = type === 'Sequence';
  return (
    <li className={styles.resultQuestion}>
      <div className={styles.resultQuestionHead}>
        <span className={styles.lead}>{question.text}</span>
        {question.isCorrect === null ? null : (
          <Badge tone={question.isCorrect ? 'success' : 'warning'} hasDot>
            {question.isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة'}
          </Badge>
        )}
      </div>
      {type ? <p className={styles.muted}>{CHOICE_TYPE_LABELS[type]}</p> : null}
      <AnswerOptionList label="إجابة الطفل" options={question.childAnswers} isOrdered={isOrdered} />
      <AnswerOptionList
        label="الإجابة الصحيحة"
        options={question.correctAnswers}
        isOrdered={isOrdered}
      />
    </li>
  );
}

function CategoryRow({
  category,
  isExpanded,
}: {
  category: AssessmentResultCategory;
  isExpanded: boolean;
}) {
  // Only counts the server sent (a missing one is never shown as 0).
  const counts =
    category.totalQuestions === null || category.correctAnswers === null
      ? null
      : `${category.correctAnswers.toString()} من ${category.totalQuestions.toString()} إجابات صحيحة`;
  return (
    <li className={styles.list}>
      <ProgressBar label={category.name} value={category.percentage} max={100} showLabel />
      {counts ? <p className={styles.muted}>{counts}</p> : null}
      {category.questions.length > 0 && isExpanded ? (
        <ul className={styles.list} aria-label={`أسئلة ${category.name}`}>
          {category.questions.map((question) => (
            <QuestionRow key={question.id} question={question} />
          ))}
        </ul>
      ) : null}
      {category.questions.length > 0 && !isExpanded ? (
        <details>
          <summary>{`تفاصيل الأسئلة (${category.questions.length.toString()})`}</summary>
          <ul className={styles.list} aria-label={`أسئلة ${category.name}`}>
            {category.questions.map((question) => (
              <QuestionRow key={question.id} question={question} />
            ))}
          </ul>
        </details>
      ) : null}
    </li>
  );
}

/**
 * The server's initial-assessment result, in neutral words (no diagnosis or interpretation).
 * Per-question details appear only when the server sends them (staff roles); `isExpanded` shows
 * them directly (the dedicated assessment page) instead of behind «تفاصيل الأسئلة».
 */
export function AssessmentResultView({
  result,
  isExpanded = false,
}: {
  result: AssessmentResult;
  isExpanded?: boolean;
}) {
  return (
    <>
      <ProgressBar
        label="النتيجة العامة للتقييم المبدئي"
        value={result.overallScore}
        max={100}
        showLabel
      />
      {result.categories.length > 0 ? (
        <ul className={styles.list} aria-label="النتيجة حسب التصنيف">
          {result.categories.map((category) => (
            <CategoryRow key={category.name} category={category} isExpanded={isExpanded} />
          ))}
        </ul>
      ) : null}
      <p className={styles.muted}>
        <Info aria-hidden="true" size={16} /> هذه نتيجة مبدئية يراجعها الأخصائي، وليست تشخيصاً.
      </p>
    </>
  );
}
