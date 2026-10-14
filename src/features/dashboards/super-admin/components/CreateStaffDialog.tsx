import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { STAFF_ROLES, useCreateStaffUser } from '@/features/dashboards/api/superAdminApi';
import { ROLE_DISPLAY } from '../roleDisplay';
import { staffFormSchema, type StaffFormInput, type StaffFormValues } from '../schemas/staffForm';

import styles from './superAdmin.module.css';

const EMPTY: StaffFormInput = { fullName: '', email: '', password: '', role: 'Teacher' };

export interface CreateStaffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (name: string) => void;
}

/** Super Admin: create a teacher or specialist account (`POST SuperAdmin/users`). */
export function CreateStaffDialog({ isOpen, onClose, onCreated }: CreateStaffDialogProps) {
  const create = useCreateStaffUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StaffFormInput, unknown, StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (isOpen) reset(EMPTY);
  }, [isOpen, reset]);

  const close = () => {
    create.reset();
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    create.mutate(values, {
      onSuccess: () => {
        create.reset();
        onCreated(values.fullName);
      },
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="إضافة حساب موظف"
      description="أنشئ حساب معلم أو أخصائي. يسجّل الموظف دخوله بالبريد وكلمة المرور."
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={create.error} />
        <FormField label="الاسم الكامل" error={errors.fullName?.message} isRequired>
          {(field) => <Input {...field} {...register('fullName')} autoComplete="off" />}
        </FormField>
        <FormField label="البريد الإلكتروني" error={errors.email?.message} isRequired>
          {(field) => (
            <Input {...field} {...register('email')} type="email" dir="ltr" autoComplete="off" />
          )}
        </FormField>
        <FormField label="كلمة المرور" error={errors.password?.message} isRequired>
          {(field) => (
            <Input
              {...field}
              {...register('password')}
              type="password"
              dir="ltr"
              autoComplete="new-password"
            />
          )}
        </FormField>
        <FormField label="الدور" error={errors.role?.message} isRequired>
          {(field) => (
            <Select {...field} {...register('role')}>
              {STAFF_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_DISPLAY[role].label}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={create.isPending}
          iconStart={<UserPlus aria-hidden="true" />}
        >
          إنشاء الحساب
        </Button>
      </form>
    </Modal>
  );
}
