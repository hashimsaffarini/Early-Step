import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import { PLAN_STATUS_DISPLAY } from '../labels';
import {
  educationPlanSchema,
  type EducationPlanFormInput,
  type EducationPlanFormValues,
} from '../schemas/educationPlan';
import { PLAN_STATUSES } from '../types';

import styles from './PlanFormDialog.module.css';

const EMPTY_VALUES: EducationPlanFormInput = {
  title: '',
  goals: '',
  strategies: '',
  status: 'active',
  reviewDate: '',
  notes: '',
};

export interface PlanFormDialogProps {
  isOpen: boolean;
  childName: string;
  onClose: () => void;
  onCreate: (values: EducationPlanFormValues) => void;
}

/** Replit "خطة تعليمية فردية" form (Specialist/Admin). UI only — the page keeps plans locally. */
export function PlanFormDialog({ isOpen, childName, onClose, onCreate }: PlanFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EducationPlanFormInput, unknown, EducationPlanFormValues>({
    resolver: zodResolver(educationPlanSchema),
    defaultValues: EMPTY_VALUES,
  });

  const close = () => {
    reset(EMPTY_VALUES);
    onClose();
  };

  const onSubmit = handleSubmit((values) => {
    onCreate(values);
    reset(EMPTY_VALUES);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="lg"
      title="خطة تعليمية جديدة"
      description={`أدخل أهداف واستراتيجيات دعم ${childName}.`}
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <FormField label="عنوان الخطة" error={errors.title?.message} isRequired>
          {(field) => (
            <Input {...field} {...register('title')} placeholder="مثال: خطة دعم القراءة" />
          )}
        </FormField>
        <FormField
          label="الأهداف"
          hint="اكتب كل هدف في سطر."
          error={errors.goals?.message}
          isRequired
        >
          {(field) => <Textarea {...field} {...register('goals')} rows={4} />}
        </FormField>
        <FormField
          label="الاستراتيجيات"
          hint="اكتب كل استراتيجية في سطر."
          error={errors.strategies?.message}
          isRequired
        >
          {(field) => <Textarea {...field} {...register('strategies')} rows={4} />}
        </FormField>
        <div className={styles.row}>
          <FormField label="الحالة" error={errors.status?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('status')}>
                {PLAN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {PLAN_STATUS_DISPLAY[status].label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
          <FormField label="تاريخ المراجعة" error={errors.reviewDate?.message}>
            {(field) => <Input {...field} {...register('reviewDate')} type="date" />}
          </FormField>
        </div>
        <FormField label="ملاحظات" error={errors.notes?.message}>
          {(field) => <Textarea {...field} {...register('notes')} rows={3} />}
        </FormField>
        <Button type="submit" size="lg" fullWidth iconStart={<Save aria-hidden="true" />}>
          حفظ الخطة
        </Button>
      </form>
    </Modal>
  );
}
