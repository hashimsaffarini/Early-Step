import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Save } from 'lucide-react';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, PasswordInput } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

import { useChangePasswordMutation } from '../api/authMutations';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/changePassword';
import styles from '../pages/AuthForm.module.css';

import { PasswordStrengthMeter } from './PasswordStrengthMeter';

const EMPTY: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * «تغيير كلمة المرور» for every signed-in role (client revision 2026-11): the user's own password
 * through `POST Auth/change-password`. The session stays signed in; the server's message is shown
 * on failure (e.g. a wrong current password).
 */
export function ChangePasswordDialog({ isOpen, onClose }: ChangePasswordDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title="تغيير كلمة المرور">
      {isOpen ? <ChangePasswordForm onDone={onClose} /> : null}
    </Modal>
  );
}

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const mutation = useChangePasswordMutation();
  const toast = useToast();
  const strengthId = useId();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: EMPTY,
  });
  const newPassword = useWatch({ control, name: 'newPassword' });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate(values, {
      onSuccess: () => {
        toast.success('تم تغيير كلمة المرور بنجاح');
        onDone();
      },
    });
  });

  return (
    <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
      <ApiErrorAlert error={mutation.error} />
      <FormField label="كلمة المرور الحالية" error={errors.currentPassword?.message} isRequired>
        {(field) => (
          <PasswordInput
            {...field}
            {...register('currentPassword')}
            autoComplete="current-password"
            leadingIcon={<Lock />}
          />
        )}
      </FormField>
      <div className={styles.fieldGroup}>
        <FormField label="كلمة المرور الجديدة" error={errors.newPassword?.message} isRequired>
          {(field) => (
            <PasswordInput
              {...field}
              {...register('newPassword')}
              aria-describedby={[field['aria-describedby'], strengthId].filter(Boolean).join(' ')}
              autoComplete="new-password"
              leadingIcon={<Lock />}
            />
          )}
        </FormField>
        <PasswordStrengthMeter id={strengthId} password={newPassword} />
      </div>
      <FormField
        label="تأكيد كلمة المرور الجديدة"
        error={errors.confirmPassword?.message}
        isRequired
      >
        {(field) => (
          <PasswordInput
            {...field}
            {...register('confirmPassword')}
            autoComplete="new-password"
            leadingIcon={<Lock />}
          />
        )}
      </FormField>
      <Button
        type="submit"
        fullWidth
        isLoading={mutation.isPending}
        iconStart={<Save aria-hidden="true" />}
      >
        حفظ كلمة المرور
      </Button>
    </form>
  );
}
