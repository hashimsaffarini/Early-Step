import { Users } from 'lucide-react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { ROLE_LABELS } from '@/constants/roleLabels';

import type { ChatContact } from '../types';

import styles from './NewConversationDialog.module.css';

export interface NewConversationDialogProps {
  isOpen: boolean;
  contacts: readonly ChatContact[];
  onClose: () => void;
  onPick: (contact: ChatContact) => void;
}

/** Replit "محادثة جديدة" contact picker (native dialog: Escape closes). */
export function NewConversationDialog({
  isOpen,
  contacts,
  onClose,
  onPick,
}: NewConversationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="محادثة جديدة"
      description="اختر المستخدم لبدء محادثة معه"
    >
      {contacts.length === 0 ? (
        <EmptyState isBoxed={false} icon={<Users />} title="لا يوجد مستخدمون متاحون للتواصل معهم" />
      ) : (
        <ul className={styles.list}>
          {contacts.map((contact) => (
            <li key={contact.id}>
              <button
                type="button"
                className={styles.contact}
                onClick={() => {
                  onPick(contact);
                }}
              >
                <Avatar name={contact.name} shape="circle" />
                <span>
                  <span className={styles.name}>{contact.name}</span>
                  <span className={styles.role}>{ROLE_LABELS[contact.role]}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
