import { BriefcaseMedical } from 'lucide-react';
import { useId, useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { Checkbox, FormField, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import type { ChildSummary } from '@/services/api/childrenLists';

import { useAdminSpecialists, useAssignSpecialist } from '../api/usersQueries';

import styles from '../pages/users.module.css';

const MESSAGES = {
  specialistRequired: 'يرجى اختيار الأخصائي',
  childrenRequired: 'يرجى اختيار طفل واحد على الأقل',
} as const;

export interface AssignSpecialistFormProps {
  childrenOfParent: readonly ChildSummary[];
}

/**
 * Assign a parent's children to a specialist (`POST Admin/assign-children-to-specialist`).
 * Specialists come from `Admin/users?Role=أخصائي/ة`. Confirmation step before sending.
 */
export function AssignSpecialistForm({ childrenOfParent }: AssignSpecialistFormProps) {
  const headingId = useId();
  const specialists = useAdminSpecialists();
  const assign = useAssignSpecialist();
  const [specialistId, setSpecialistId] = useState('');
  const [childIds, setChildIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ specialist?: string; children?: string }>({});
  const [isConfirming, setIsConfirming] = useState(false);

  const specialistOptions = (specialists.data?.users ?? []).filter(
    (user) => user.role === 'Specialist',
  );
  const specialistName = specialistOptions.find((user) => user.id === specialistId)?.name ?? '';

  const toggleChild = (id: string) => {
    setChildIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const validate = () => {
    const next = {
      ...(specialistId ? {} : { specialist: MESSAGES.specialistRequired }),
      ...(childIds.length > 0 ? {} : { children: MESSAGES.childrenRequired }),
    };
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <Card as="section" className={styles.assign} aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="إسناد الأطفال إلى أخصائي" icon={BriefcaseMedical} />
      {assign.isSuccess ? (
        <Alert tone="success">{`تم إسناد الأطفال المختارين إلى ${specialistName}.`}</Alert>
      ) : null}
      <ApiErrorAlert error={assign.error} />
      <ApiErrorAlert error={specialists.error} />
      <form
        className={styles.assign}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (validate()) setIsConfirming(true);
        }}
      >
        <FormField label="الأخصائي" error={errors.specialist} isRequired>
          {(field) => (
            <Select
              {...field}
              value={specialistId}
              disabled={specialists.isPending}
              onChange={(event) => {
                setSpecialistId(event.target.value);
                assign.reset();
              }}
            >
              <option value="">
                {specialists.isPending ? 'جارٍ تحميل الأخصائيين…' : 'اختر الأخصائي'}
              </option>
              {specialistOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <fieldset className={styles.checkList}>
          <legend className={styles.legend}>الأطفال</legend>
          {childrenOfParent.map((child) => (
            <Checkbox
              key={child.id}
              label={
                child.specialistName
                  ? `${child.fullName} (الأخصائي الحالي: ${child.specialistName})`
                  : child.fullName
              }
              checked={childIds.includes(child.id)}
              onChange={() => {
                toggleChild(child.id);
                assign.reset();
              }}
            />
          ))}
        </fieldset>
        {errors.children ? (
          <p className={styles.fieldError} role="alert">
            {errors.children}
          </p>
        ) : null}
        <Button type="submit" isLoading={assign.isPending}>
          إسناد
        </Button>
      </form>
      <ConfirmDialog
        isOpen={isConfirming}
        tone="primary"
        title="تأكيد الإسناد"
        description={`سيتم إسناد ${childIds.length.toString()} من الأطفال إلى ${specialistName}.`}
        confirmLabel="تأكيد"
        isConfirming={assign.isPending}
        onConfirm={() => {
          assign.mutate(
            { specialistId, childIds },
            {
              onSettled: () => {
                setIsConfirming(false);
              },
              onSuccess: () => {
                setChildIds([]);
              },
            },
          );
        }}
        onCancel={() => {
          setIsConfirming(false);
        }}
      />
    </Card>
  );
}
