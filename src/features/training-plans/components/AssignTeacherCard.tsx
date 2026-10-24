import { GraduationCap, RefreshCw, X } from 'lucide-react';
import { useId, useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';
import { FormField, Select } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

import { useAssignTeacherMutation, useTeachers } from '../api/trainingPlansQueries';

import styles from './plans.module.css';

export interface AssignTeacherCardProps {
  childId: string;
  childName: string;
  /** Current teacher from the specialist plan (null when none / no plan). */
  currentTeacherName: string | null;
}

/**
 * The child's teacher (Specialist). Client revision 2026-10: with a teacher assigned only a compact
 * line «المعلم المسؤول: …» stays, with a small «تغيير المعلم»; the full form is shown only when there
 * is no teacher or while changing. Teachers from `GET specialist/teachers`;
 * `POST specialist/assign-teacher { teacherId, childIds: [childId] }` with confirmation; the plan
 * re-fetches and a temporary toast confirms it.
 */
export function AssignTeacherCard({
  childId,
  childName,
  currentTeacherName,
}: AssignTeacherCardProps) {
  const headingId = useId();
  const toast = useToast();
  const [isChanging, setIsChanging] = useState(false);
  const showForm = currentTeacherName === null || isChanging;

  if (!showForm) {
    return (
      <div className={styles.teacherSummary}>
        <GraduationCap className={styles.teacherIcon} aria-hidden="true" />
        <p className={styles.teacherName}>{`المعلم المسؤول: ${currentTeacherName}`}</p>
        <Button
          variant="ghost"
          size="sm"
          iconStart={<RefreshCw aria-hidden="true" />}
          onClick={() => {
            setIsChanging(true);
          }}
        >
          تغيير المعلم
        </Button>
      </div>
    );
  }

  return (
    <Card as="section" className={styles.teacherCard} aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        title={isChanging ? 'تغيير المعلم المسؤول' : 'تعيين معلم'}
        icon={GraduationCap}
        iconTone="success"
        action={
          isChanging ? (
            <Button
              variant="ghost"
              size="sm"
              iconStart={<X aria-hidden="true" />}
              onClick={() => {
                setIsChanging(false);
              }}
            >
              إلغاء
            </Button>
          ) : undefined
        }
      />
      <p className={styles.teacherCurrent}>
        {currentTeacherName
          ? `المعلم الحالي: ${currentTeacherName}`
          : 'لم يتم تعيين معلم لهذا الطفل بعد.'}
      </p>
      <TeacherForm
        childId={childId}
        childName={childName}
        onAssigned={(name) => {
          setIsChanging(false);
          toast.success(`تم تعيين ${name} معلماً لـ ${childName} بنجاح`);
        }}
      />
    </Card>
  );
}

function TeacherForm({
  childId,
  childName,
  onAssigned,
}: {
  childId: string;
  childName: string;
  onAssigned: (teacherName: string) => void;
}) {
  const teachers = useTeachers(true);
  const assign = useAssignTeacherMutation();
  const [teacherId, setTeacherId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const selected = teachers.data?.find((teacher) => teacher.id === teacherId) ?? null;

  return (
    <>
      <ApiErrorAlert error={teachers.error} onRetry={() => void teachers.refetch()} />
      <ApiErrorAlert error={assign.error} />
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
                onAssigned(selected.name);
              },
              onSettled: () => {
                setIsConfirming(false);
              },
            },
          );
        }}
      />
    </>
  );
}
