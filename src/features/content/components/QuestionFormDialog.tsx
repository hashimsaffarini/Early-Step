import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Checkbox, FormField, Input, Select, Textarea } from '@/components/ui/Field';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';

import { useCreateQuestion } from '../api/contentQueries';
import { MIN_OPTIONS, questionSchema, type QuestionFormValues } from '../schemas/contentForms';
import { QUESTION_TYPE_LABELS, QUESTION_TYPES } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

const MAX_OPTIONS = 8;

const EMPTY_OPTION: QuestionFormValues['options'][number] = {
  text: '',
  image: null,
  isCorrect: false,
  correctOrder: '',
  pairKey: '',
};

const TYPE_HINTS = {
  SingleChoice: 'حدّد الإجابة الصحيحة الوحيدة.',
  MultiSelect: 'حدّد كل الإجابات الصحيحة.',
  Sequence: 'أدخل الترتيب الصحيح لكل خيار (1، 2، 3…).',
  Matching: 'أعطِ الخيارات المتطابقة مفتاح المطابقة نفسه (مثل: أ، ب).',
} as const;

export interface QuestionFormDialogProps {
  activityId: string;
  onClose: () => void;
}

/**
 * Add a question with its options (multipart `Options[i].*`). The answer fields shown depend on
 * the type: IsCorrect (single/multi), CorrectOrder (sequence), PairKey (matching).
 */
export function QuestionFormDialog({ activityId, onClose }: QuestionFormDialogProps) {
  const createMutation = useCreateQuestion();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      image: null,
      type: 'SingleChoice',
      options: [EMPTY_OPTION, EMPTY_OPTION],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const type = useWatch({ control, name: 'type' });

  const onSubmit = handleSubmit((values) => {
    createMutation.mutate(
      {
        activityId,
        input: {
          text: values.text,
          image: values.image,
          type: values.type,
          options: values.options.map((option) => ({
            text: option.text,
            image: option.image,
            isCorrect: option.isCorrect,
            correctOrder: option.correctOrder ? Number(option.correctOrder) : null,
            pairKey: option.pairKey || null,
          })),
        },
      },
      { onSuccess: onClose },
    );
  });

  const selectSingleCorrect = (index: number) => {
    getValues('options').forEach((_, optionIndex) => {
      setValue(`options.${optionIndex}.isCorrect`, optionIndex === index);
    });
  };

  const optionsError = errors.options?.root?.message ?? errors.options?.message;

  return (
    <Modal isOpen onClose={onClose} size="lg" title="إضافة سؤال">
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={createMutation.error} />
        <FormField label="نص السؤال" error={errors.text?.message} isRequired>
          {(field) => <Textarea {...field} {...register('text')} rows={2} />}
        </FormField>
        <div className={styles.twoColumns}>
          <FormField label="نوع السؤال" error={errors.type?.message} hint={TYPE_HINTS[type]}>
            {(field) => (
              <Select {...field} {...register('type')}>
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
                label="صورة السؤال (اختيارية)"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>الخيارات</legend>
          {optionsError ? (
            <p className={styles.fieldError} role="alert">
              {optionsError}
            </p>
          ) : null}
          {fields.map((item, index) => {
            const number = (index + 1).toString();
            return (
              <div key={item.id} className={styles.optionRow}>
                <div className={styles.optionHeader}>
                  <span>{`الخيار ${number}`}</span>
                  <IconButton
                    label={`حذف الخيار ${number}`}
                    icon={Trash2}
                    variant="danger"
                    disabled={fields.length <= MIN_OPTIONS}
                    onClick={() => {
                      remove(index);
                    }}
                  />
                </div>
                <FormField
                  label={`نص الخيار ${number}`}
                  error={errors.options?.[index]?.text?.message}
                >
                  {(field) => <Input {...field} {...register(`options.${index}.text`)} />}
                </FormField>
                <Controller
                  control={control}
                  name={`options.${index}.image`}
                  render={({ field, fieldState }) => (
                    <ImageField
                      label={`صورة الخيار ${number} (اختيارية)`}
                      value={field.value}
                      onChange={field.onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                {type === 'SingleChoice' ? (
                  <Controller
                    control={control}
                    name={`options.${index}.isCorrect`}
                    render={({ field }) => (
                      <label className={styles.optionHeader}>
                        <input
                          type="radio"
                          name="single-correct"
                          checked={field.value}
                          onChange={() => {
                            selectSingleCorrect(index);
                          }}
                        />
                        {`الخيار ${number} هو الإجابة الصحيحة`}
                      </label>
                    )}
                  />
                ) : null}
                {type === 'MultiSelect' ? (
                  <Checkbox label="إجابة صحيحة" {...register(`options.${index}.isCorrect`)} />
                ) : null}
                {type === 'Sequence' ? (
                  <FormField label={`الترتيب الصحيح للخيار ${number}`}>
                    {(field) => (
                      <Input
                        {...field}
                        {...register(`options.${index}.correctOrder`)}
                        inputMode="numeric"
                        dir="ltr"
                      />
                    )}
                  </FormField>
                ) : null}
                {type === 'Matching' ? (
                  <FormField label={`مفتاح المطابقة للخيار ${number}`}>
                    {(field) => <Input {...field} {...register(`options.${index}.pairKey`)} />}
                  </FormField>
                ) : null}
              </div>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            iconStart={<Plus aria-hidden="true" />}
            disabled={fields.length >= MAX_OPTIONS}
            onClick={() => {
              append(EMPTY_OPTION);
            }}
          >
            إضافة خيار
          </Button>
        </fieldset>

        <Button
          type="submit"
          fullWidth
          isLoading={createMutation.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ السؤال
        </Button>
      </form>
    </Modal>
  );
}
