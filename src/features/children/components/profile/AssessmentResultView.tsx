import { Info } from 'lucide-react';

import { CHOICE_TYPE_LABELS, toChoiceQuestionType } from '@/components/players';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/Feedback';
import type {
  AssessmentResult,
  AssessmentResultCategory,
  AssessmentResultOption,
  AssessmentResultQuestion,
} from '@/services/api/assessmentResult';

import styles from './profile.module.css';

function optionList(options: readonly AssessmentResultOption[], isOrdered: boolean): string {
  const texts = options.map((option) => option.text || 'خيار بصورة');
  return texts.length === 0 ? '—' : texts.join(isOrdered ? ' ← ' : '، ');
}

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
      <ul className={styles.meta}>
        {type ? <li>{CHOICE_TYPE_LABELS[type]}</li> : null}
        <li>{`إجابة الطفل: ${optionList(question.childAnswers, isOrdered)}`}</li>
        <li>{`الإجابة الصحيحة: ${optionList(question.correctAnswers, isOrdered)}`}</li>
      </ul>
    </li>
  );
}

function CategoryRow({ category }: { category: AssessmentResultCategory }) {
  const counts =
    category.totalQuestions === null
      ? null
      : `${(category.correctAnswers ?? 0).toString()} من ${category.totalQuestions.toString()} إجابات صحيحة`;
  return (
    <li className={styles.list}>
      <ProgressBar label={category.name} value={category.percentage} max={100} showLabel />
      {counts ? <p className={styles.muted}>{counts}</p> : null}
      {category.questions.length > 0 ? (
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
 * Per-question details appear only when the server sends them (staff roles).
 */
export function AssessmentResultView({ result }: { result: AssessmentResult }) {
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
            <CategoryRow key={category.name} category={category} />
          ))}
        </ul>
      ) : null}
      <p className={styles.muted}>
        <Info aria-hidden="true" size={16} /> هذه نتيجة مبدئية يراجعها الأخصائي، وليست تشخيصاً.
      </p>
    </>
  );
}
