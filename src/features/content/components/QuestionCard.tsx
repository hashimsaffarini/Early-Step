import { Check, CheckCheck, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/Modal';

import { useDeleteAllOptions, useDeleteOption, useDeleteQuestion } from '../api/contentQueries';
import { QUESTION_TYPE_LABELS, type Question, type QuestionOption } from '../types';

import styles from './content.module.css';
import { CorrectAnswersDialog } from './CorrectAnswersDialog';
import { OptionEditDialog } from './OptionEditDialog';
import { QuestionInfoDialog } from './QuestionInfoDialog';
import { IMAGE_NOT_SERVED, ServerImage } from '@/components/shared/ServerImage';

type PendingDelete =
  { kind: 'question' } | { kind: 'allOptions' } | { kind: 'option'; option: QuestionOption };

function answerLabel(question: Question, option: QuestionOption): string | null {
  if (question.type === 'Sequence') {
    return option.correctOrder === null
      ? null
      : `الترتيب الصحيح: ${option.correctOrder.toString()}`;
  }
  return option.isCorrect ? 'إجابة صحيحة' : null;
}

export interface QuestionCardProps {
  question: Question;
  index: number;
}

/** One question with its options and edit/delete actions (all deletes confirmed). */
export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAnswers, setIsEditingAnswers] = useState(false);
  const [editingOption, setEditingOption] = useState<QuestionOption | null>(null);
  const [pending, setPending] = useState<PendingDelete | null>(null);
  const deleteQuestion = useDeleteQuestion();
  const deleteOption = useDeleteOption();
  const deleteAllOptions = useDeleteAllOptions();

  const number = (index + 1).toString();
  const isDeleting =
    deleteQuestion.isPending || deleteOption.isPending || deleteAllOptions.isPending;
  const error = deleteQuestion.error ?? deleteOption.error ?? deleteAllOptions.error;

  const confirm = () => {
    if (!pending) return;
    // Close on failure too, so the error alert below is not hidden behind the dialog.
    const done = {
      onSettled: () => {
        setPending(null);
      },
    };
    if (pending.kind === 'question') deleteQuestion.mutate(question.id, done);
    if (pending.kind === 'allOptions') deleteAllOptions.mutate(question.id, done);
    if (pending.kind === 'option') deleteOption.mutate(pending.option.id, done);
  };

  const dialogCopy = {
    question: { title: 'حذف السؤال', description: 'سيتم حذف السؤال وخياراته نهائياً.' },
    allOptions: {
      title: 'حذف جميع الخيارات',
      description:
        'سيتم حذف كل خيارات هذا السؤال. لا تتيح الواجهة البرمجية إضافة خيار لسؤال موجود، لذا ستحتاج إلى إنشاء السؤال من جديد.',
    },
    option: { title: 'حذف الخيار', description: 'سيتم حذف هذا الخيار نهائياً.' },
  } as const;

  return (
    <Card as="article" className={styles.questionCard} aria-labelledby={`question-${question.id}`}>
      <div className={styles.questionHeader}>
        <div className={styles.rowMain}>
          <h3 id={`question-${question.id}`} className={styles.rowTitle}>
            {`${number}. ${question.text || 'سؤال بلا نص'}`}
          </h3>
          <ul className={styles.meta} aria-label="تفاصيل السؤال">
            <li>
              <Badge tone="primary">
                {question.type ? QUESTION_TYPE_LABELS[question.type] : 'نوع غير معروف'}
              </Badge>
            </li>
            <li>
              <Badge>{`${question.options.length.toString()} خيارات`}</Badge>
            </li>
          </ul>
        </div>
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="sm"
            iconStart={<Pencil aria-hidden="true" />}
            onClick={() => {
              setIsEditingInfo(true);
            }}
          >
            تعديل السؤال
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconStart={<CheckCheck aria-hidden="true" />}
            disabled={question.options.length === 0}
            onClick={() => {
              setIsEditingAnswers(true);
            }}
          >
            الإجابة الصحيحة
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={question.options.length === 0}
            onClick={() => {
              setPending({ kind: 'allOptions' });
            }}
          >
            حذف كل الخيارات
          </Button>
          <Button
            variant="danger"
            size="sm"
            iconStart={<Trash2 aria-hidden="true" />}
            onClick={() => {
              setPending({ kind: 'question' });
            }}
          >
            حذف السؤال
          </Button>
        </div>
      </div>

      <ServerImage
        path={question.imageUrl}
        alt={`صورة السؤال ${number}`}
        className={styles.questionImage}
        fallback={question.imageUrl ? <p className={styles.muted}>{IMAGE_NOT_SERVED}</p> : null}
      />
      <ApiErrorAlert error={error} />

      {question.options.length === 0 ? (
        <p className={styles.muted}>لا توجد خيارات لهذا السؤال.</p>
      ) : (
        <ul className={styles.options} aria-label={`خيارات السؤال ${number}`}>
          {question.options.map((option, optionIndex) => {
            const label = option.text || `الخيار ${(optionIndex + 1).toString()}`;
            const answer = answerLabel(question, option);
            return (
              <li key={option.id} className={styles.option}>
                <span className={styles.optionMain}>
                  <ServerImage
                    path={option.imageUrl}
                    alt={label}
                    className={styles.optionImage}
                    fallback={
                      option.imageUrl ? (
                        <span className={styles.muted}>(صورة غير متاحة من الخادم)</span>
                      ) : null
                    }
                  />
                  <span>{label}</span>
                  {answer ? (
                    <Badge tone="success">
                      <Check aria-hidden="true" size={14} /> {answer}
                    </Badge>
                  ) : null}
                </span>
                <span className={styles.actions}>
                  <IconButton
                    label={`تعديل الخيار: ${label}`}
                    icon={Pencil}
                    variant="muted"
                    onClick={() => {
                      setEditingOption(option);
                    }}
                  />
                  <IconButton
                    label={`حذف الخيار: ${label}`}
                    icon={Trash2}
                    variant="danger"
                    onClick={() => {
                      setPending({ kind: 'option', option });
                    }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {isEditingAnswers ? (
        <CorrectAnswersDialog
          question={question}
          number={number}
          onClose={() => {
            setIsEditingAnswers(false);
          }}
        />
      ) : null}
      {isEditingInfo ? (
        <QuestionInfoDialog
          question={question}
          onClose={() => {
            setIsEditingInfo(false);
          }}
        />
      ) : null}
      {editingOption ? (
        <OptionEditDialog
          option={editingOption}
          position={question.options.indexOf(editingOption) + 1}
          onClose={() => {
            setEditingOption(null);
          }}
        />
      ) : null}
      <ConfirmDialog
        isOpen={pending !== null}
        title={pending ? dialogCopy[pending.kind].title : ''}
        description={pending ? dialogCopy[pending.kind].description : ''}
        confirmLabel="حذف"
        tone="danger"
        isConfirming={isDeleting}
        onConfirm={confirm}
        onCancel={() => {
          setPending(null);
        }}
      />
    </Card>
  );
}
