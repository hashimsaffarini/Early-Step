import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { useCreateCategory, useUpdateCategory } from '../api/contentQueries';
import { categorySchema, type CategoryFormValues } from '../schemas/contentForms';
import type { Category } from '../types';

import styles from './content.module.css';

export interface CategoryFormDialogProps {
  /** `null` = create; a category = edit. The dialog is mounted only while open. */
  category: Category | null;
  onClose: () => void;
}

export function CategoryFormDialog({ category, onClose }: CategoryFormDialogProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const mutation = category ? updateMutation : createMutation;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '' },
  });

  const onSubmit = handleSubmit(({ name }) => {
    if (category) {
      updateMutation.mutate({ id: category.id, name }, { onSuccess: onClose });
    } else {
      createMutation.mutate(name, { onSuccess: onClose });
    }
  });

  return (
    <Modal isOpen onClose={onClose} title={category ? 'تعديل التصنيف' : 'إضافة تصنيف'}>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={mutation.error} />
        <FormField label="اسم التصنيف" error={errors.name?.message} isRequired>
          {(field) => <Input {...field} {...register('name')} autoComplete="off" />}
        </FormField>
        <Button
          type="submit"
          fullWidth
          isLoading={mutation.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ
        </Button>
      </form>
    </Modal>
  );
}
