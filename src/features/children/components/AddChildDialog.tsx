import { zodResolver } from '@hookform/resolvers/zod';
import { Save, User } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { CHILD_GENDER_LABELS } from '@/constants/childDisplay';
import { toIsoDateString } from '@/utils/dateFormat';

import {
  addChildSchema,
  type AddChildFormInput,
  type AddChildFormValues,
} from '../schemas/addChild';

import styles from './AddChildDialog.module.css';

const COPY = {
  title: 'إضافة ملف طفل جديد',
  description: 'أدخل بيانات طفلك الأساسية.',
  name: 'اسم الطفل',
  namePlaceholder: 'مثال: سارة',
  birthDate: 'تاريخ الميلاد',
  gender: 'الجنس',
  genderPlaceholder: 'اختر…',
  save: 'حفظ',
} as const;

const EMPTY_VALUES: AddChildFormInput = { name: '', birthDate: '', gender: '' };

export interface AddChildDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (values: AddChildFormValues) => void;
}

/** Replit add-child dialog (UI only — the parent page keeps the child in local state). */
export function AddChildDialog({ isOpen, onClose, onAdd }: AddChildDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddChildFormInput, unknown, AddChildFormValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: EMPTY_VALUES,
  });

  const close = () => {
    reset(EMPTY_VALUES);
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    onAdd(values);
    reset(EMPTY_VALUES);
  });

  return (
    <Modal isOpen={isOpen} onClose={close} title={COPY.title} description={COPY.description}>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
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
          <FormField label={COPY.birthDate} error={errors.birthDate?.message} isRequired>
            {(field) => (
              <Input
                {...field}
                {...register('birthDate')}
                type="date"
                max={toIsoDateString(new Date())}
              />
            )}
          </FormField>
          <FormField label={COPY.gender} error={errors.gender?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('gender')}>
                <option value="" disabled>
                  {COPY.genderPlaceholder}
                </option>
                <option value="boy">{CHILD_GENDER_LABELS.boy}</option>
                <option value="girl">{CHILD_GENDER_LABELS.girl}</option>
              </Select>
            )}
          </FormField>
        </div>
        <Button type="submit" size="lg" fullWidth iconStart={<Save aria-hidden="true" />}>
          {COPY.save}
        </Button>
      </form>
    </Modal>
  );
}
