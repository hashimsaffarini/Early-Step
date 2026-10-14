import { BriefcaseMedical, GraduationCap, UserRound, Users, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { StatCard } from '@/components/shared/StatCard';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { ADMIN_PATHS } from '@/constants/routes';
import { ROLE_LABELS } from '@/constants/roleLabels';

import { useAdminUsers } from '../api/usersQueries';
import { ROLE_WIRE_VALUES, type AdminUsersTotals, type FilterableRole } from '../api/usersApi';
import { RoleBadge } from '../components/RoleBadge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

import styles from './users.module.css';

type RoleFilter = FilterableRole | 'all';

const FILTERS: readonly { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'Parent', label: ROLE_LABELS.Parent },
  { value: 'Teacher', label: ROLE_LABELS.Teacher },
  { value: 'Specialist', label: ROLE_LABELS.Specialist },
];

function TotalsRow({ totals }: { totals: AdminUsersTotals }) {
  const items = [
    { key: 'totalUsers', label: 'إجمالي المستخدمين', value: totals.totalUsers, icon: Users },
    { key: 'totalParents', label: 'أولياء الأمور', value: totals.totalParents, icon: UserRound },
    { key: 'totalTeachers', label: 'المعلمون', value: totals.totalTeachers, icon: GraduationCap },
    {
      key: 'totalSpecialists',
      label: 'الأخصائيون',
      value: totals.totalSpecialists,
      icon: BriefcaseMedical,
    },
  ].filter((item): item is typeof item & { value: number } => item.value !== null);
  if (items.length === 0) return null;
  return (
    <ul className={styles.statsGrid} aria-label="إحصائيات المستخدمين">
      {items.map((item) => (
        <li key={item.key}>
          <StatCard label={item.label} value={item.value} icon={item.icon} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Admin users list (`GET Admin/users?Role=&Search=`): server-side search and role filter,
 * totals from the server. Read-only — no user management endpoints exist (BLOCKED BY BACKEND).
 */
export function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const search = useDebouncedValue(query.trim());
  const users = useAdminUsers(roleFilter === 'all' ? '' : ROLE_WIRE_VALUES[roleFilter], search);

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
  } else if (users.data.users.length === 0) {
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
        {users.data.users.map((user) => (
          <li key={user.id} className={styles.row}>
            <Avatar name={user.name} />
            <div className={styles.identity}>
              <p className={styles.name}>
                <Link to={ADMIN_PATHS.userDetail(user.id)} className={styles.nameLink}>
                  {user.name}
                </Link>
              </p>
              {user.email ? (
                <bdi dir="ltr" className={styles.email}>
                  {user.email}
                </bdi>
              ) : null}
            </div>
            <div className={styles.meta}>
              <RoleBadge role={user.role} roleValue={user.roleValue} />
              {user.childrenCount !== null && user.role === 'Parent' ? (
                <Badge>{`الأطفال: ${user.childrenCount.toString()}`}</Badge>
              ) : null}
              {user.emailConfirmed === false ? (
                <Badge tone="warning">البريد غير مؤكَّد</Badge>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="المستخدمون"
        subtitle="أولياء الأمور والمعلمون والأخصائيون المسجّلون في المنصة."
      />
      {users.data ? <TotalsRow totals={users.data.totals} /> : null}
      <div className={styles.toolbar}>
        <SearchField
          label="ابحث بالاسم أو البريد..."
          placeholder="ابحث بالاسم أو البريد..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
        />
        <div className={styles.chips} role="group" aria-label="تصفية حسب الدور">
          {FILTERS.map((filter) => (
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
      <Alert tone="info">
        إنشاء حسابات المعلمين والأخصائيين وإيقافها متاح للمدير العام فقط (لوحة المدير العام).
      </Alert>
      {content}
    </div>
  );
}
