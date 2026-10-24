import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { Checkbox, FormField, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import {
  ROLE_WIRE_VALUES,
  STAFF_ROLES,
  useUpdateUser,
  type PanelUser,
} from '@/features/dashboards/api/superAdminApi';

import { ROLE_DISPLAY } from '../roleDisplay';
import { staffEditSchema, type StaffEditValues } from '../schemas/staffForm';

import styles from './superAdmin.module.css';

export interface EditStaffDialogProps {
  /** Mounted only while editing. */
  user: PanelUser;
  onClose: () => void;
  onSaved: (name: string) => void;
}

const isStaff = (user: PanelUser) =>
  user.role !== null && (STAFF_ROLES as readonly string[]).includes(user.role);

/**
 * Super Admin edits an employee (client revision 2026-10): name, email, role (a teacher or
 * specialist can switch between the two; other roles are kept as they are) and the active state.
 * Prefilled with the user's current values; saved with `PUT SuperAdmin/users/{id}` and the users
 * list re-fetches.
 */
export function EditStaffDialog({ user, onClose, onSaved }: EditStaffDialogProps) {
  const update = useUpdateUser();
  const staff = isStaff(user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffEditValues>({
    resolver: zodResolver(staffEditSchema),
    defaultValues: {
      fullName: user.name,
      email: user.email ?? '',
      role: user.roleValue,
      isActive: user.isActive,
    },
  });

  const onSubmit = handleSubmit((values) => {
    update.mutate(
      {
        id: user.id,
        fullName: values.fullName,
        email: values.email,
        roleValue: values.role,
        isActive: values.isActive,
      },
      {
        onSuccess: () => {
          onSaved(values.fullName);
        },
      },
    );
  });

  return (
    <Modal isOpen onClose={onClose} title="تعديل بيانات الموظف" description={user.name}>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={update.error} />
        <FormField label="الاسم الكامل" error={errors.fullName?.message} isRequired>
          {(field) => <Input {...field} {...register('fullName')} autoComplete="off" />}
        </FormField>
        <FormField label="البريد الإلكتروني" error={errors.email?.message} isRequired>
          {(field) => (
            <Input {...field} {...register('email')} type="email" dir="ltr" autoComplete="off" />
          )}
        </FormField>
        {staff ? (
          <FormField label="الدور" error={errors.role?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('role')}>
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={ROLE_WIRE_VALUES[role]}>
                    {ROLE_DISPLAY[role].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        ) : (
          // Other roles keep their saved role (sent back unchanged from the form's values).
          <FormField label="الدور" hint="لا يتغيّر دور هذا الحساب من هنا.">
            {(field) => (
              <Input
                {...field}
                value={user.role ? ROLE_DISPLAY[user.role].label : user.roleValue}
                readOnly
              />
            )}
          </FormField>
        )}
        <Checkbox label="الحساب مفعّل (يستطيع تسجيل الدخول)" {...register('isActive')} />
        <Button
          type="submit"
          size="lg"
          fullWidth
          isLoading={update.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ التعديلات
        </Button>
      </form>
    </Modal>
  );
}
