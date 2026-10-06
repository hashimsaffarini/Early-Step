import { GraduationCap } from 'lucide-react';
import { useId, useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { FormField, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';

import { useAssignTeacherMutation, useTeachers } from '../api/trainingPlansQueries';

import styles from './plans.module.css';

export interface AssignTeacherCardProps {
  childId: string;
  childName: string;
  /** Current teacher from the specialist plan (null when none / no plan). */
  currentTeacherName: string | null;
}

/**
 * Specialist assigns the child's teacher: teachers from `GET specialist/teachers`,
 * `POST specialist/assign-teacher { teacherId, childIds: [childId] }`, with confirmation.
 */
export function AssignTeacherCard({
  childId,
  childName,
  currentTeacherName,
}: AssignTeacherCardProps) {
  const headingId = useId();
  const teachers = useTeachers(true);
  const assign = useAssignTeacherMutation();
  const [teacherId, setTeacherId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [lastAssigned, setLastAssigned] = useState<string | null>(null);
  const selected = teachers.data?.find((teacher) => teacher.id === teacherId) ?? null;

  return (
    <Card as="section" className={styles.teacherCard} aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        title="المعلم المسؤول"
        icon={GraduationCap}
        iconTone="success"
      />
      <p className={styles.teacherCurrent}>
        {currentTeacherName
          ? `المعلم الحالي: ${currentTeacherName}`
          : 'لم يُعيَّن معلم لهذا الطفل بعد.'}
      </p>
      {lastAssigned ? (
        <Alert tone="success">{`تم تعيين ${lastAssigned} معلماً لـ ${childName}.`}</Alert>
      ) : null}
      <ApiErrorAlert error={teachers.error ?? assign.error} />
      <div className={styles.teacherRow}>
        <FormField label="اختر المعلم">
          {(field) => (
            <Select
              {...field}
              value={teacherId}
              disabled={teachers.isPending || (teachers.data?.length ?? 0) === 0}
              onChange={(event) => {
                setTeacherId(event.target.value);
              }}
            >
              <option value="">{teachers.isPending ? 'جارٍ تحميل المعلمين…' : 'اختر…'}</option>
              {teachers.data?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <Button
          disabled={!selected}
          isLoading={assign.isPending}
          onClick={() => {
            setIsConfirming(true);
          }}
        >
          تعيين المعلم
        </Button>
      </div>
      {teachers.data?.length === 0 ? (
        <Alert tone="info">لا يوجد معلمون متاحون حالياً.</Alert>
      ) : null}
      <ConfirmDialog
        isOpen={isConfirming}
        title="تعيين المعلم"
        description={`سيتم تعيين ${selected?.name ?? ''} معلماً لـ ${childName}.`}
        confirmLabel="تعيين"
        tone="primary"
        isConfirming={assign.isPending}
        onCancel={() => {
          setIsConfirming(false);
        }}
        onConfirm={() => {
          if (!selected) return;
          assign.mutate(
            { teacherId: selected.id, childIds: [childId] },
            {
              onSuccess: () => {
                setLastAssigned(selected.name);
                setTeacherId('');
              },
              onSettled: () => {
                setIsConfirming(false);
              },
            },
          );
        }}
      />
    </Card>
  );
}
