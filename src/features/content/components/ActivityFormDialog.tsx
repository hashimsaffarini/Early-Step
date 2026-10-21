import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { ActivityType } from '@/services/api/activityType';

import { useSaveActivity } from '../api/contentQueries';
import { activitySchema, type ActivityFormValues } from '../schemas/contentForms';
import { ACTIVITY_TYPE_LABELS, ADD_LABELS, type ActivitySummary, type Category } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

export interface ActivityFormDialogProps {
  type: ActivityType;
  /** `null` = create. Mounted only while open. */
  activity: ActivitySummary | null;
  categories: readonly Category[];
  onClose: () => void;
}

/** Create/edit an activity (multipart: Title, Description, Slug, CategoryId, Icon). */
export function ActivityFormDialog({
  type,
  activity,
  categories,
  onClose,
}: ActivityFormDialogProps) {
  const saveMutation = useSaveActivity();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      slug: activity?.slug ?? '',
      categoryId: activity?.categoryId ?? '',
      icon: null,
    },
  });

  const onSubmit = handleSubmit((values) => {
    saveMutation.mutate({ type, id: activity?.id ?? null, input: values }, { onSuccess: onClose });
  });

  const typeLabel = ACTIVITY_TYPE_LABELS[type];
  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={activity ? 'تعديل النشاط' : ADD_LABELS[type]}
      description={`النوع: ${typeLabel}`}
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={saveMutation.error} />
        <FormField label="عنوان النشاط" error={errors.title?.message} isRequired>
          {(field) => <Input {...field} {...register('title')} autoComplete="off" />}
        </FormField>
        <FormField label="الوصف" error={errors.description?.message}>
          {(field) => <Textarea {...field} {...register('description')} rows={3} />}
        </FormField>
        <div className={styles.twoColumns}>
          <FormField
            label="المعرّف المختصر (Slug)"
            hint="أحرف إنجليزية صغيرة وأرقام وشرطات، مثل: letters-test"
            error={errors.slug?.message}
            isRequired
          >
            {(field) => <Input {...field} {...register('slug')} dir="ltr" autoComplete="off" />}
          </FormField>
          <FormField label="التصنيف" error={errors.categoryId?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('categoryId')}>
                <option value="" disabled>
                  اختر…
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
        <Controller
          control={control}
          name="icon"
          render={({ field, fieldState }) => (
            <ImageField
              label="أيقونة النشاط"
              hint={activity ? 'اترك الحقل فارغاً للإبقاء على الأيقونة الحالية.' : 'اختيارية.'}
              value={field.value}
              onChange={field.onChange}
              existingPath={activity?.iconUrl}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          fullWidth
          isLoading={saveMutation.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ
        </Button>
      </form>
    </Modal>
  );
}
