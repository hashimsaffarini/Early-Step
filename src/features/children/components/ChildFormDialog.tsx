import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { ChildSummary } from '@/services/api/childrenLists';

import { useCreateChild, useUpdateChild } from '../api/childrenQueries';
import {
  CHILD_FORM_MESSAGES,
  childFormSchema,
  MAX_CHILD_AGE,
  MIN_CHILD_AGE,
  type ChildFormInput,
  type ChildFormValues,
} from '../schemas/childForm';

import styles from './ChildFormDialog.module.css';

const COPY = {
  addTitle: 'إضافة ملف طفل جديد',
  editTitle: 'تعديل بيانات الطفل',
  description: 'أدخل بيانات طفلك الأساسية.',
  name: 'اسم الطفل',
  namePlaceholder: 'مثال: سارة',
  age: 'العمر (بالسنوات)',
  gender: 'الجنس',
  genderPlaceholder: 'اختر…',
  boy: 'ولد',
  girl: 'بنت',
  save: 'حفظ',
} as const;

const EMPTY_VALUES: ChildFormInput = { name: '', age: '', gender: '' };

function toFormInput(child: ChildSummary | undefined): ChildFormInput {
  if (!child) return EMPTY_VALUES;
  return { name: child.fullName, age: child.age?.toString() ?? '', gender: child.gender ?? '' };
}

export interface ChildFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the server accepted the change. */
  onSaved: (name: string) => void;
  /** Present → edit this child; absent → add a new child. */
  child?: ChildSummary | undefined;
}

/** Add / edit child (Replit add-child dialog), saved through the Parent API. */
export function ChildFormDialog({ isOpen, onClose, onSaved, child }: ChildFormDialogProps) {
  const isEdit = child !== undefined;
  const createMutation = useCreateChild();
  const updateMutation = useUpdateChild(child?.id ?? '');
  const mutation = isEdit ? updateMutation : createMutation;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChildFormInput, unknown, ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: toFormInput(child),
  });

  useEffect(() => {
    if (isOpen) reset(toFormInput(child));
  }, [isOpen, child, reset]);

  const close = () => {
    mutation.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(
      { fullName: values.name, age: values.age, gender: values.gender },
      {
        onSuccess: () => {
          mutation.reset();
          onSaved(values.name);
        },
      },
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={isEdit ? COPY.editTitle : COPY.addTitle}
      description={COPY.description}
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={mutation.error} />
        <FormField label={COPY.name} error={errors.name?.message} isRequired>
          {(field) => (
            <Input
              {...field}
              {...register('name')}
              autoComplete="off"
              placeholder={COPY.namePlaceholder}
              leadingIcon={<User />}
            />
          )}
        </FormField>
        <div className={styles.row}>
          <FormField
            label={COPY.age}
            hint={CHILD_FORM_MESSAGES.ageHint}
            error={errors.age?.message}
            isRequired
          >
            {(field) => (
              <Input
                {...field}
                {...register('age')}
                type="number"
                inputMode="numeric"
                min={MIN_CHILD_AGE}
                max={MAX_CHILD_AGE}
                step={1}
              />
            )}
          </FormField>
          <FormField label={COPY.gender} error={errors.gender?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('gender')}>
                <option value="" disabled>
                  {COPY.genderPlaceholder}
                </option>
                <option value="ولد">{COPY.boy}</option>
                <option value="بنت">{COPY.girl}</option>
              </Select>
            )}
          </FormField>
        </div>
        <Button
          type="submit"
          size="lg"
          fullWidth
          iconStart={<Save aria-hidden="true" />}
          isLoading={mutation.isPending}
        >
          {COPY.save}
        </Button>
      </form>
    </Modal>
  );
}
