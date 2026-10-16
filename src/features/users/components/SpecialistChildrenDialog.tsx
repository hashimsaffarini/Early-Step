import { CircleCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { LoadingState } from '@/components/shared/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Checkbox } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';

import type { AdminSpecialist } from '../api/usersApi';
import { useAdminUser, useAssignableChildren, useAssignSpecialist } from '../api/usersQueries';

import styles from '../pages/users.module.css';

export interface SpecialistChildrenDialogProps {
  specialist: AdminSpecialist;
  onClose: () => void;
}

/**
 * One specialist's children (client revision 2026-10): the children already assigned
 * (`GET Admin/users/{specialistId}` → `children`) and every other child, each with its current
 * specialist, to assign in one request (`POST Admin/assign-children-to-specialist { specialistId,
 * childIds[] }` — several children per call is the documented contract). Lists refresh after saving.
 */
export function SpecialistChildrenDialog({ specialist, onClose }: SpecialistChildrenDialogProps) {
  const detail = useAdminUser(specialist.id);
  const children = useAssignableChildren();
  const assign = useAssignSpecialist();
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const assignedIds = new Set((detail.data?.children ?? []).map((child) => child.id));
  const candidates = (children.data ?? []).filter((child) => !assignedIds.has(child.id));

  const submit = () => {
    const count = selected.length;
    assign.mutate(
      { specialistId: specialist.id, childIds: selected },
      {
        onSuccess: () => {
          setSelected([]);
          setNotice(
            `تم إسناد ${count.toString()} ${count === 1 ? 'طفل' : 'أطفال'} إلى ${specialist.name}.`,
          );
        },
      },
    );
  };

  let assignedSection;
  if (detail.isPending) {
    assignedSection = <LoadingState label="جارٍ تحميل الأطفال المسندين…" />;
  } else if (detail.isError) {
    assignedSection = <ApiErrorAlert error={detail.error} onRetry={() => void detail.refetch()} />;
  } else if (detail.data.children.length === 0) {
    assignedSection = <p className={styles.muted}>لا يوجد أطفال مسندون إلى هذا الأخصائي بعد.</p>;
  } else {
    assignedSection = (
      <ul className={styles.assignedList} aria-label="الأطفال المسندون">
        {detail.data.children.map((child) => (
          <li key={child.id} className={styles.assignedItem}>
            <CircleCheck aria-hidden="true" className={styles.assignedIcon} />
            <span className={styles.childText}>
              <span className={styles.name}>{child.fullName}</span>
              {child.parentName ? (
                <span className={styles.muted}>{`ولي الأمر: ${child.parentName}`}</span>
              ) : null}
            </span>
            <Badge tone="success">مُسند</Badge>
          </li>
        ))}
      </ul>
    );
  }

  let candidatesSection;
  if (children.isPending || detail.isPending) {
    candidatesSection = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (children.isError) {
    candidatesSection = (
      <ApiErrorAlert error={children.error} onRetry={() => void children.refetch()} />
    );
  } else if (candidates.length === 0) {
    candidatesSection = <p className={styles.muted}>لا يوجد أطفال آخرون لإسنادهم.</p>;
  } else {
    candidatesSection = (
      <fieldset
        className={styles.candidateList}
        disabled={!specialist.isActive || assign.isPending}
      >
        <legend className="visually-hidden">اختر الأطفال لإسنادهم</legend>
        {candidates.map((child) => (
          <Checkbox
            key={child.id}
            className={styles.candidate}
            label={
              <span className={styles.childText}>
                <span className={styles.name}>{child.fullName}</span>
                <span className={styles.muted}>
                  {child.specialistName ? `الأخصائي الحالي: ${child.specialistName}` : 'بلا أخصائي'}
                </span>
              </span>
            }
            checked={selected.includes(child.id)}
            onChange={(event) => {
              const isChecked = event.currentTarget.checked;
              setNotice(null);
              setSelected((ids) =>
                isChecked ? [...ids, child.id] : ids.filter((id) => id !== child.id),
              );
            }}
          />
        ))}
      </fieldset>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title={`أطفال ${specialist.name}`}>
      <div className={styles.assign}>
        {!specialist.isActive ? (
          <Alert tone="warning">هذا الحساب غير نشط، لذلك لا يمكن إسناد أطفال إليه.</Alert>
        ) : null}
        {notice ? <Alert tone="success">{notice}</Alert> : null}
        <ApiErrorAlert error={assign.error} />
        <section aria-labelledby="assigned-children-title">
          <h3 id="assigned-children-title" className={styles.legend}>
            {detail.data
              ? `الأطفال المسندون حالياً (${detail.data.children.length.toString()})`
              : 'الأطفال المسندون حالياً'}
          </h3>
          {assignedSection}
        </section>
        <section aria-labelledby="assign-children-title">
          <h3 id="assign-children-title" className={styles.legend}>
            اختر أطفالاً لإسنادهم
          </h3>
          {candidatesSection}
        </section>
        <Button
          fullWidth
          iconStart={<UserPlus aria-hidden="true" />}
          disabled={!specialist.isActive || selected.length === 0}
          isLoading={assign.isPending}
          onClick={submit}
        >
          {selected.length > 0
            ? `إسناد المحددين (${selected.length.toString()})`
            : 'إسناد المحددين'}
        </Button>
      </div>
    </Modal>
  );
}
