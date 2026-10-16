import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { useUpdateOption } from '../api/contentQueries';
import { optionEditSchema, type OptionEditFormValues } from '../schemas/contentForms';
import type { QuestionOption } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

export interface OptionEditDialogProps {
  option: QuestionOption;
  /** 1-based place of the option in the question (the backend does not store `Order`). */
  position: number;
  onClose: () => void;
}

/**
 * Edit one option's text, image and display order (`PUT Admin/question-options/{id}`, multipart).
 * Correctness is edited for the whole question in «الإجابة الصحيحة»; this dialog sends the option's
 * current `IsCorrect` / `CorrectOrder` unchanged.
 */
export function OptionEditDialog({ option, position, onClose }: OptionEditDialogProps) {
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
      // Live: options read back with `order: 0` (not stored); the position is what the admin sees.
      order: String(option.order === null || option.order === 0 ? position : option.order),
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
          isCorrect: option.isCorrect,
          correctOrder: option.correctOrder,
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
