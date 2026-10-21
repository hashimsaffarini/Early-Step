import { CircleCheck, UserPlus } from 'lucide-react';
import { useId, useState } from 'react';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { LoadingState } from '@/components/shared/LoadingState';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Modal } from '@/components/ui/Modal';
import type { ChildSummary } from '@/services/api/childrenLists';

import { useAdminSpecialists, useAssignSpecialist } from '../api/usersQueries';

import styles from '../pages/users.module.css';

export interface AssignChildSpecialistDialogProps {
  child: ChildSummary;
  onClose: () => void;
}

/**
 * «+ تعيين أخصائي» for one child (client revision 2026-10): the real specialists
 * (`GET Admin/specialists`) as selectable cards with their active state and the current one
 * marked; inactive specialists cannot be chosen. Saves through the documented
 * `POST Admin/assign-children-to-specialist { specialistId, childIds: [childId] }`; user and
 * children data refresh afterwards.
 */
export function AssignChildSpecialistDialog({ child, onClose }: AssignChildSpecialistDialogProps) {
  const groupName = useId();
  const specialists = useAdminSpecialists();
  const assign = useAssignSpecialist();
  const [selectedId, setSelectedId] = useState('');
  // The child's specialist after a save here (the lists re-fetch in the background).
  const [currentName, setCurrentName] = useState(child.specialistName);
  const [notice, setNotice] = useState<string | null>(null);

  const options = specialists.data ?? [];
  const selected = options.find((specialist) => specialist.id === selectedId);

  let list;
  if (specialists.isPending) {
    list = <LoadingState label="جارٍ تحميل الأخصائيين…" />;
  } else if (specialists.isError) {
    list = <ApiErrorAlert error={specialists.error} onRetry={() => void specialists.refetch()} />;
  } else if (options.length === 0) {
    list = <p className={styles.muted}>لا يوجد أخصائيون في النظام بعد.</p>;
  } else {
    list = (
      <fieldset className={styles.candidateList} disabled={assign.isPending}>
        <legend className="visually-hidden">اختر الأخصائي</legend>
        {options.map((specialist) => {
          const isCurrent = currentName !== null && specialist.name === currentName;
          return (
            <label
              key={specialist.id}
              className={styles.specialistOption}
              data-inactive={!specialist.isActive || undefined}
            >
              <input
                type="radio"
                name={groupName}
                value={specialist.id}
                className={styles.radio}
                checked={selectedId === specialist.id}
                disabled={!specialist.isActive}
                onChange={() => {
                  setSelectedId(specialist.id);
                  setNotice(null);
                  assign.reset();
                }}
              />
              <Avatar name={specialist.name} size="sm" />
              <span className={styles.childText}>
                <span className={styles.name}>{specialist.name}</span>
                {specialist.email ? (
                  <bdi dir="ltr" className={styles.email}>
                    {specialist.email}
                  </bdi>
                ) : null}
              </span>
              <span className={styles.optionBadges}>
                {isCurrent ? (
                  <Badge tone="primary">
                    <CircleCheck aria-hidden="true" size={14} />
                    الحالي
                  </Badge>
                ) : null}
                {specialist.isActive ? (
                  <Badge tone="success">نشط</Badge>
                ) : (
                  <Badge tone="danger">غير نشط</Badge>
                )}
              </span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`تعيين أخصائي لـ ${child.fullName}`}
      description={
        currentName ? `الأخصائي الحالي: ${currentName}` : 'لم يُعيَّن أخصائي لهذا الطفل بعد.'
      }
    >
      <div className={styles.assign}>
        {notice ? <Alert tone="success">{notice}</Alert> : null}
        <ApiErrorAlert error={assign.error} />
        {list}
        <p className={styles.muted}>الأخصائيون غير النشطين لا يمكن تعيينهم.</p>
        <Button
          fullWidth
          iconStart={<UserPlus aria-hidden="true" />}
          disabled={!selected || selected.name === currentName}
          isLoading={assign.isPending}
          onClick={() => {
            if (!selected) return;
            assign.mutate(
              { specialistId: selected.id, childIds: [child.id] },
              {
                onSuccess: () => {
                  setCurrentName(selected.name);
                  setSelectedId('');
                  setNotice(`تم تعيين ${selected.name} أخصائياً لـ ${child.fullName}.`);
                },
              },
            );
          }}
        >
          تعيين الأخصائي
        </Button>
      </div>
    </Modal>
  );
}
