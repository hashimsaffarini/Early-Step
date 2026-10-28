import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { useUpdateQuestionInfo } from '../api/contentQueries';
import { questionInfoSchema, type QuestionInfoFormValues } from '../schemas/contentForms';
import { QUESTION_TYPE_LABELS, QUESTION_TYPES, type Question } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

export interface QuestionInfoDialogProps {
  question: Question;
  onClose: () => void;
}

/** Edit text / image / type (`PUT Admin/questions/{id}/info`). Options are edited separately. */
export function QuestionInfoDialog({ question, onClose }: QuestionInfoDialogProps) {
  const updateMutation = useUpdateQuestionInfo();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuestionInfoFormValues>({
    resolver: zodResolver(questionInfoSchema),
    // An unknown server type is never silently replaced: the admin must pick one.
    defaultValues: {
      text: question.text,
      image: null,
      ...(question.type === null ? {} : { type: question.type }),
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate({ id: question.id, input: values }, { onSuccess: onClose });
  });

  return (
    <Modal isOpen onClose={onClose} title="تعديل السؤال">
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={updateMutation.error} />
        <FormField label="نص السؤال" error={errors.text?.message} isRequired>
          {(field) => <Textarea {...field} {...register('text')} rows={2} />}
        </FormField>
        <FormField
          label="نوع السؤال"
          error={errors.type?.message}
          hint="يقبل الخادم تغيير النوع فقط إذا ناسبته الإجابات الحالية (إجابة صحيحة واحدة للاختيار الفردي، وترتيب صحيح لكل خيار في الترتيب). عدّل «الإجابة الصحيحة» أولاً عند الحاجة."
        >
          {(field) => (
            <Select {...field} {...register('type')}>
              {question.type === null ? <option value="">اختر النوع…</option> : null}
              {QUESTION_TYPES.map((questionType) => (
                <option key={questionType} value={questionType}>
                  {QUESTION_TYPE_LABELS[questionType]}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <ImageField
              label="صورة السؤال"
              hint="اترك الحقل فارغاً للإبقاء على الصورة الحالية."
              value={field.value}
              onChange={field.onChange}
              existingPath={question.imageUrl}
              mediaKey={`question:${question.id}`}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          fullWidth
          isLoading={updateMutation.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ
        </Button>
      </form>
    </Modal>
  );
}
