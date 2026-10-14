import { UserMinus, UserPlus, UserX } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SearchField } from '@/components/shared/SearchField';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import {
  ROLE_WIRE_VALUES,
  useDeactivateUser,
  useSuperAdminUsers,
  type PanelUser,
} from '@/features/dashboards/api/superAdminApi';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSession } from '@/services/session';
import type { UserRole } from '@/types/roles';

import { ROLE_DISPLAY } from '../roleDisplay';
import { CreateStaffDialog } from './CreateStaffDialog';

import styles from './superAdmin.module.css';

type RoleFilter = UserRole | 'all';

/** Roles the backend can filter by (wire values observed live). */
const FILTERABLE_ROLES = Object.keys(ROLE_WIRE_VALUES) as UserRole[];

/**
 * Users from `GET SuperAdmin/users?Search=&Role=` (server-side search and filter). The Super
 * Admin creates teacher / specialist accounts and deactivates accounts (`SuperAdmin/users`).
 * Editing is not offered: the list does not return `isActive`, which the edit endpoint requires.
 */
export function UsersTab() {
  const session = useSession();
  const deactivate = useDeactivateUser();
  const [isCreating, setIsCreating] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<PanelUser | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const search = useDebouncedValue(query.trim());
  const roleValue = roleFilter === 'all' ? '' : (ROLE_WIRE_VALUES[roleFilter] ?? '');
  const users = useSuperAdminUsers(roleValue, search);

  const filters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'الكل' },
    ...FILTERABLE_ROLES.map((role) => ({ value: role, label: ROLE_DISPLAY[role].label })),
  ];

  let content;
  if (users.isPending) {
    content = <LoadingState label="جارٍ تحميل المستخدمين…" />;
  } else if (users.error) {
    content = (
      <ErrorState
        title="تعذّر تحميل المستخدمين"
        description={users.error.message}
        action={
          <Button variant="outline" onClick={() => void users.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (users.data.length === 0) {
    content = (
      <EmptyState
        icon={<UserX />}
        title="لا يوجد مستخدمون مطابقون"
        description="جرّب اسماً آخر أو دوراً آخر."
      />
    );
  } else {
    content = (
      <ul className={styles.list} aria-label="المستخدمون">
        {users.data.map((user) => {
          const role = user.role ? ROLE_DISPLAY[user.role] : null;
          return (
            <li key={user.id} className={styles.row}>
              <Avatar name={user.name} />
              <div className={styles.identity}>
                <p className={styles.name}>{user.name}</p>
                {user.email ? (
                  <bdi dir="ltr" className={styles.email}>
                    {user.email}
                  </bdi>
                ) : null}
              </div>
              <div className={styles.meta}>
                <Badge tone={role?.badgeTone ?? 'neutral'}>
                  {role ? <role.icon aria-hidden="true" size={14} /> : null}
                  {role?.label ?? user.roleValue}
                </Badge>
                {user.role !== 'SuperAdmin' && user.id !== session?.user.id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconStart={<UserMinus aria-hidden="true" />}
                    aria-label={`إيقاف حساب ${user.name}`}
                    onClick={() => {
                      deactivate.reset();
                      setToDeactivate(user);
                    }}
                  >
                    إيقاف
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

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
            </button>
          ))}
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          iconStart={<UserPlus aria-hidden="true" />}
          onClick={() => {
            setNotice(null);
            setIsCreating(true);
          }}
        >
          إضافة موظف
        </Button>
      </div>
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <ApiErrorAlert error={deactivate.error} />
      {content}
      <CreateStaffDialog
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
        }}
        onCreated={(name) => {
          setIsCreating(false);
          setNotice(`تم إنشاء حساب ${name}.`);
        }}
      />
      <ConfirmDialog
        isOpen={toDeactivate !== null}
        title="إيقاف الحساب"
        description={`لن يتمكن ${toDeactivate?.name ?? ''} من تسجيل الدخول بعد الإيقاف. يبقى الحساب ظاهراً في القائمة.`}
        confirmLabel="إيقاف"
        isConfirming={deactivate.isPending}
        onConfirm={() => {
          if (!toDeactivate) return;
          const { id, name } = toDeactivate;
          deactivate.mutate(id, {
            onSuccess: () => {
              setNotice(`تم إيقاف حساب ${name}.`);
            },
            onSettled: () => {
              setToDeactivate(null);
            },
          });
        }}
        onCancel={() => {
          setToDeactivate(null);
        }}
      />
    </div>
  );
}
