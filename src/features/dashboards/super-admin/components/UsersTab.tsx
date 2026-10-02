import { Trash2, UserX } from 'lucide-react';
import { useState } from 'react';

import { ComingSoonButton } from '@/components/shared/ComingSoonButton';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchField } from '@/components/shared/SearchField';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';
import { ConfirmDialog } from '@/components/ui/Modal';
import { matchesName } from '@/features/dashboards/roster';
import type { RosterUser } from '@/features/dashboards/types';
import type { UserRole } from '@/types/roles';

import { ROLE_DISPLAY, ROLE_ORDER } from '../roleDisplay';

import styles from './superAdmin.module.css';

type RoleFilter = UserRole | 'all';

export interface UsersTabProps {
  users: readonly RosterUser[];
  /** Id of the signed-in super admin (cannot delete themselves). */
  currentUserId: string | undefined;
  onDelete: (userId: string) => void;
}

/** Replit "إدارة المستخدمين": search, role filter, user rows with actions. Local state only. */
export function UsersTab({ users, currentUserId, onDelete }: UsersTabProps) {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [pendingDelete, setPendingDelete] = useState<RosterUser | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const visible = users.filter(
    (user) => (roleFilter === 'all' || user.role === roleFilter) && matchesName(user.name, query),
  );
  const filters: { value: RoleFilter; label: string; count: number }[] = [
    { value: 'all', label: 'الكل', count: users.length },
    ...ROLE_ORDER.map((role) => ({
      value: role,
      label: ROLE_DISPLAY[role].label,
      count: users.filter((user) => user.role === role).length,
    })),
  ];

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onDelete(pendingDelete.id);
    setStatusMessage(`تم حذف ${pendingDelete.name} من القائمة المحلية فقط.`);
    setPendingDelete(null);
  };

  return (
    <div className={styles.tab}>
      <div className={styles.toolbar}>
        <SearchField
          label="ابحث عن مستخدم..."
          placeholder="ابحث عن مستخدم..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div className={styles.chips} role="group" aria-label="تصفية حسب الدور">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={styles.chip}
              aria-pressed={roleFilter === filter.value}
              onClick={() => {
                setRoleFilter(filter.value);
              }}
            >
              {filter.label}
              <span className={styles.chipCount}>{filter.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p className={styles.statusMessage} role="status">
        {statusMessage}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          icon={<UserX />}
          title="لا يوجد مستخدمون مطابقون"
          description="جرّب اسماً آخر أو دوراً آخر."
        />
      ) : (
        <ul className={styles.list} aria-label="المستخدمون">
          {visible.map((user) => {
            const role = ROLE_DISPLAY[user.role];
            const isSelf = user.id === currentUserId;
            return (
              <li key={user.id} className={styles.row}>
                <Avatar name={user.name} />
                <div className={styles.identity}>
                  <p className={styles.name}>
                    {user.name} {isSelf ? <span className={styles.self}>(أنت)</span> : null}
                  </p>
                  <bdi dir="ltr" className={styles.email}>
                    {user.email}
                  </bdi>
                </div>
                <div className={styles.meta}>
                  <Badge tone={role.badgeTone}>
                    <role.icon aria-hidden="true" size={14} />
                    {role.label}
                  </Badge>
                  <div className={styles.rowActions}>
                    <ComingSoonButton variant="outline">تغيير الدور</ComingSoonButton>
                    <IconButton
                      label={`حذف ${user.name}`}
                      icon={Trash2}
                      variant="danger"
                      disabled={isSelf}
                      onClick={() => {
                        setPendingDelete(user);
                      }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="حذف المستخدم"
        description={`هذا الإجراء لا يمكن التراجع عنه. سيتم حذف ${pendingDelete?.name ?? ''} وجميع بياناته. (نسخة تجريبية: الحذف محلي فقط ولا يُرسل شيء.)`}
        confirmLabel="حذف"
        onConfirm={confirmDelete}
        onCancel={() => {
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
