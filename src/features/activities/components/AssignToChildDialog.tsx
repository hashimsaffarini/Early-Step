import { Check, Users } from 'lucide-react';
import { useId, useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

import type { AssignableChild } from '../mock/assignableChildren.mock';

import styles from './AssignToChildDialog.module.css';
import type { ActivityKind } from './catalogTypes';

const KIND_LABEL: Record<ActivityKind, string> = { test: 'اختبار', game: 'لعبة' };

export interface AssignToChildDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activityTitle: string;
  kind: ActivityKind;
  childrenList: readonly AssignableChild[];
  /** Local confirmation only — nothing is saved (UI prototype). */
  onAssign: (child: AssignableChild) => void;
}

/** Pick a child to assign a test/game to (Replit assign modal). UI only. */
export function AssignToChildDialog({
  isOpen,
  onClose,
  activityTitle,
  kind,
  childrenList,
  onAssign,
}: AssignToChildDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const groupName = useId();
  const selected = childrenList.find((child) => child.id === selectedId);

  const close = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title={`تعيين ${KIND_LABEL[kind]}: ${activityTitle}`}
      description="اختر الطفل لتعيين هذا النشاط له."
      footer={
        childrenList.length > 0 ? (
          <div className={styles.footer}>
            <Button variant="ghost" onClick={close}>
              إلغاء
            </Button>
            <Button
              disabled={!selected}
              iconStart={<Check aria-hidden="true" />}
              onClick={() => {
                if (!selected) return;
                onAssign(selected);
                setSelectedId(null);
              }}
            >
              تعيين
            </Button>
          </div>
        ) : undefined
      }
    >
      {childrenList.length === 0 ? (
        <EmptyState
          icon={<Users />}
          title="لا يوجد أطفال"
          description="لا يوجد أطفال يمكن تعيين النشاط لهم."
          isBoxed={false}
        />
      ) : (
        <fieldset className={styles.list}>
          <legend className="visually-hidden">الأطفال</legend>
          {childrenList.map((child) => (
            <label key={child.id} className={styles.option}>
              <input
                type="radio"
                className={styles.radio}
                name={groupName}
                value={child.id}
                checked={child.id === selectedId}
                onChange={() => {
                  setSelectedId(child.id);
                }}
              />
              <Avatar name={child.name} />
              <span className={styles.text}>
                <span className={styles.name}>{child.name}</span>
                <span className={styles.parent}>{`ولي الأمر: ${child.parentName}`}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}
    </Modal>
  );
}
