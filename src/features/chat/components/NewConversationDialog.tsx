import { Users } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SearchField } from '@/components/shared/SearchField';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { ROLE_LABELS } from '@/constants/roleLabels';

import type { ChatContact } from '../types';

import styles from './NewConversationDialog.module.css';

export interface NewConversationDialogProps {
  isOpen: boolean;
  contacts: readonly ChatContact[];
  isLoading: boolean;
  error: Error | null;
  onClose: () => void;
  onPick: (contact: ChatContact) => void;
}

/** "محادثة جديدة" picker over `GET Chats/users` (search is client-side — no API parameter). */
export function NewConversationDialog({
  isOpen,
  contacts,
  isLoading,
  error,
  onClose,
  onPick,
}: NewConversationDialogProps) {
  const [search, setSearch] = useState('');
  const term = search.trim();
  const visible = term ? contacts.filter((contact) => contact.name.includes(term)) : contacts;

  const renderBody = () => {
    if (isLoading) return <LoadingState label="جارٍ تحميل المستخدمين…" />;
    if (error) {
      return (
        <ErrorState isBoxed={false} title="تعذّر تحميل المستخدمين" description={error.message} />
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          isBoxed={false}
          icon={<Users />}
          title={term ? 'لا توجد نتائج مطابقة' : 'لا يوجد مستخدمون متاحون للتواصل معهم'}
        />
      );
    }
    return (
      <ul className={styles.list}>
        {visible.map((contact) => (
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
                {contact.role ? (
                  <span className={styles.role}>{ROLE_LABELS[contact.role]}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="محادثة جديدة"
      description="اختر المستخدم لبدء محادثة معه"
    >
      <SearchField
        label="البحث عن مستخدم"
        placeholder="ابحث بالاسم…"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />
      {renderBody()}
    </Modal>
  );
}
