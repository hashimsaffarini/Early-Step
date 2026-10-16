import { ArrowDown, ArrowUp, Save } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Checkbox } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';

import { useSaveCorrectAnswers } from '../api/contentQueries';
import { currentSequence, type CorrectAnswerChoice } from '../api/correctAnswers';
import type { Question, QuestionOption } from '../types';

import styles from './content.module.css';

export interface CorrectAnswersDialogProps {
  question: Question;
  number: string;
  onClose: () => void;
}

function optionLabel(option: QuestionOption, index: number): string {
  return option.text || `الخيار ${(index + 1).toString()}`;
}

/** Moves the item at `index` one step up (-1) or down (+1). */
function move(ids: readonly string[], index: number, step: -1 | 1): string[] {
  const next = [...ids];
  const target = index + step;
  const [item] = next.splice(index, 1);
  if (item === undefined || target < 0 || target > ids.length - 1) return [...ids];
  next.splice(target, 0, item);
  return next;
}

/**
 * Edits which answers are correct (client revision 2026-10), by question type:
 * SingleChoice — one radio; MultiSelect — checkboxes; Sequence — the correct order (move up/down).
 * Saved through `PUT Admin/question-options/{id}` (`IsCorrect` / `CorrectOrder`), then re-fetched.
 */
export function CorrectAnswersDialog({ question, number, onClose }: CorrectAnswersDialogProps) {
  const save = useSaveCorrectAnswers();
  const [correctIds, setCorrectIds] = useState<string[]>(
    question.options.filter((option) => option.isCorrect).map((option) => option.id),
  );
  const [orderedIds, setOrderedIds] = useState<string[]>(() => currentSequence(question));
  const [validation, setValidation] = useState<string | null>(null);
  const byId = new Map(question.options.map((option, index) => [option.id, { option, index }]));
  const isSequence = question.type === 'Sequence';
  const isSingle = question.type === 'SingleChoice';

  const submit = () => {
    if (!isSequence && correctIds.length === 0) {
      setValidation('اختر إجابة صحيحة واحدة على الأقل.');
      return;
    }
    setValidation(null);
    const choice: CorrectAnswerChoice = isSequence
      ? { kind: 'sequence', orderedIds }
      : { kind: 'choice', correctIds };
    save.mutate({ question, choice }, { onSuccess: onClose });
  };

  let editor;
  if (question.type === null) {
    editor = (
      <Alert tone="warning">نوع هذا السؤال غير معروف؛ حدّد نوعه أولاً من «تعديل السؤال».</Alert>
    );
  } else if (isSequence) {
    editor = (
      <ol className={styles.sequenceList} aria-label="الترتيب الصحيح">
        {orderedIds.map((id, index) => {
          const entry = byId.get(id);
          if (!entry) return null;
          const label = optionLabel(entry.option, entry.index);
          return (
            <li key={id} className={styles.sequenceItem}>
              <span className={styles.sequenceNumber}>{(index + 1).toString()}</span>
              <span className={styles.sequenceLabel}>{label}</span>
              <IconButton
                label={`تقديم ${label}`}
                icon={ArrowUp}
                variant="muted"
                disabled={index === 0}
                onClick={() => {
                  setOrderedIds((ids) => move(ids, index, -1));
                }}
              />
              <IconButton
                label={`تأخير ${label}`}
                icon={ArrowDown}
                variant="muted"
                disabled={index === orderedIds.length - 1}
                onClick={() => {
                  setOrderedIds((ids) => move(ids, index, 1));
                }}
              />
            </li>
          );
        })}
      </ol>
    );
  } else {
    editor = (
      <fieldset className={styles.correctList}>
        <legend className={styles.legend}>
          {isSingle ? 'اختر الإجابة الصحيحة' : 'اختر كل الإجابات الصحيحة'}
        </legend>
        {question.options.map((option, index) => {
          const label = optionLabel(option, index);
          const checked = correctIds.includes(option.id);
          return isSingle ? (
            <label key={option.id} className={styles.optionHeader}>
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={checked}
                onChange={() => {
                  setCorrectIds([option.id]);
                }}
              />
              {label}
            </label>
          ) : (
            <Checkbox
              key={option.id}
              label={label}
              checked={checked}
              onChange={(event) => {
                const isChecked = event.currentTarget.checked;
                setCorrectIds((ids) =>
                  isChecked ? [...ids, option.id] : ids.filter((id) => id !== option.id),
                );
              }}
            />
          );
        })}
      </fieldset>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={`الإجابة الصحيحة — السؤال ${number}`}>
      <div className={styles.form}>
        <ApiErrorAlert error={save.error} />
        {validation ? <Alert tone="danger">{validation}</Alert> : null}
        {question.options.length === 0 ? (
          <Alert tone="info">لا توجد خيارات لهذا السؤال.</Alert>
        ) : (
          editor
        )}
        <Button
          fullWidth
          isLoading={save.isPending}
          disabled={question.type === null || question.options.length === 0}
          iconStart={<Save aria-hidden="true" />}
          onClick={submit}
        >
          حفظ الإجابة الصحيحة
        </Button>
      </div>
    </Modal>
  );
}
