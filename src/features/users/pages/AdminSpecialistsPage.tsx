import { BriefcaseMedical, Users, UserX } from 'lucide-react';
import { useState } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, type TabItem } from '@/components/ui/Tabs';

import type { AdminSpecialist } from '../api/usersApi';
import { useAdminSpecialists } from '../api/usersQueries';
import { ChildrenAssignmentList } from '../components/ChildrenAssignmentList';
import { SpecialistChildrenDialog } from '../components/SpecialistChildrenDialog';

import styles from './users.module.css';

type View = 'specialists' | 'children';

const VIEWS: readonly TabItem<View>[] = [
  {
    value: 'specialists',
    label: 'الأخصائيون',
    icon: <BriefcaseMedical aria-hidden="true" size={16} />,
  },
  { value: 'children', label: 'الأطفال', icon: <Users aria-hidden="true" size={16} /> },
];

/**
 * Specialist assignment (client revision 2026-10), two views of the same real data:
 * - الأخصائيون: `GET Admin/specialists` (real active state), «إدارة الأطفال» per specialist.
 * - الأطفال: every child with its current specialist and «+ تعيين أخصائي» per child.
 */
export function AdminSpecialistsPage() {
  const specialists = useAdminSpecialists();
  const [managing, setManaging] = useState<AdminSpecialist | null>(null);
  const [view, setView] = useState<View>('specialists');

  let content;
  if (specialists.isPending) {
    content = <LoadingState label="جارٍ تحميل الأخصائيين…" />;
  } else if (specialists.isError) {
    content = (
      <ErrorState
        title="تعذّر تحميل الأخصائيين"
        description={specialists.error.message}
        action={
          <Button variant="outline" onClick={() => void specialists.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (specialists.data.length === 0) {
    content = (
      <EmptyState
        icon={<UserX />}
        title="لا يوجد أخصائيون بعد"
        description="يُنشئ المشرف العام حسابات الأخصائيين."
      />
    );
  } else {
    content = (
      <ul className={styles.list} aria-label="الأخصائيون">
        {specialists.data.map((specialist) => (
          <li key={specialist.id} className={styles.row}>
            <Avatar name={specialist.name} />
            <div className={styles.identity}>
              <p className={styles.name}>{specialist.name}</p>
              {specialist.email ? (
                <bdi dir="ltr" className={styles.email}>
                  {specialist.email}
                </bdi>
              ) : null}
            </div>
            <div className={styles.meta}>
              {specialist.isActive ? (
                <Badge tone="success">نشط</Badge>
              ) : (
                <Badge tone="danger">غير نشط</Badge>
              )}
              <Button
                variant="soft"
                size="sm"
                iconStart={<Users aria-hidden="true" />}
                aria-label={`إدارة أطفال ${specialist.name}`}
                onClick={() => {
                  setManaging(specialist);
                }}
              >
                إدارة الأطفال
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="إسناد الأطفال إلى الأخصائيين"
        subtitle="اختر أخصائياً لإدارة أطفاله، أو اختر طفلاً لتعيين أخصائي له."
      />
      <Tabs label="طريقة العرض" items={VIEWS} value={view} onChange={setView}>
        {view === 'specialists' ? content : <ChildrenAssignmentList />}
      </Tabs>
      {managing ? (
        <SpecialistChildrenDialog
          specialist={managing}
          onClose={() => {
            setManaging(null);
          }}
        />
      ) : null}
    </div>
  );
}
