import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Checkbox, FormField, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { useUpdateOption } from '../api/contentQueries';
import {
  optionEditSchema,
  usesCorrectFlag,
  type OptionEditFormValues,
} from '../schemas/contentForms';
import type { QuestionOption, QuestionType } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

export interface OptionEditDialogProps {
  option: QuestionOption;
  questionType: QuestionType | null;
  onClose: () => void;
}

/** Edit one option (`PUT Admin/question-options/{id}`, multipart). */
export function OptionEditDialog({ option, questionType, onClose }: OptionEditDialogProps) {
  const updateMutation = useUpdateOption();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OptionEditFormValues>({
    resolver: zodResolver(optionEditSchema),
    defaultValues: {
      text: option.text,
      image: null,
      order: String(option.order ?? 1),
      isCorrect: option.isCorrect,
      correctOrder: option.correctOrder === null ? '' : String(option.correctOrder),
      pairKey: option.pairKey ?? '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    updateMutation.mutate(
      {
        id: option.id,
        input: {
          text: values.text,
          image: values.image,
          order: Number(values.order),
          isCorrect: values.isCorrect,
          correctOrder: values.correctOrder ? Number(values.correctOrder) : null,
          pairKey: values.pairKey || null,
        },
      },
      { onSuccess: onClose },
    );
  });

  return (
    <Modal isOpen onClose={onClose} title="تعديل الخيار">
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={updateMutation.error} />
        <FormField label="نص الخيار" error={errors.text?.message}>
          {(field) => <Input {...field} {...register('text')} />}
        </FormField>
        <FormField label="ترتيب العرض" error={errors.order?.message}>
          {(field) => <Input {...field} {...register('order')} inputMode="numeric" dir="ltr" />}
        </FormField>
        {usesCorrectFlag(questionType) ? (
          <Checkbox label="إجابة صحيحة" {...register('isCorrect')} />
        ) : null}
        {questionType === 'Sequence' ? (
          <FormField label="الترتيب الصحيح">
            {(field) => (
              <Input {...field} {...register('correctOrder')} inputMode="numeric" dir="ltr" />
            )}
          </FormField>
        ) : null}
        {questionType === 'Matching' ? (
          <FormField label="مفتاح المطابقة">
            {(field) => <Input {...field} {...register('pairKey')} />}
          </FormField>
        ) : null}
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <ImageField
              label="صورة الخيار"
              hint="اترك الحقل فارغاً للإبقاء على الصورة الحالية."
              value={field.value}
              onChange={field.onChange}
              existingPath={option.imageUrl}
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
