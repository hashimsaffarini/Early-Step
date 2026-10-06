import { BriefcaseMedical, CalendarDays, UserRound, Users } from 'lucide-react';
import { useState } from 'react';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SearchField } from '@/components/shared/SearchField';
import { Button } from '@/components/ui/Button';
import { useSuperAdminChildren } from '@/features/dashboards/api/superAdminApi';
import { useDebouncedValue } from '@/features/dashboards/useDebouncedValue';
import { formatAge } from '@/utils/age';

import styles from './superAdmin.module.css';

/** All registered children from `GET SuperAdmin/children?Name=` (server-side name search). */
export function ChildrenTab() {
  const [query, setQuery] = useState('');
  const name = useDebouncedValue(query.trim());
  const children = useSuperAdminChildren(name);

  let content;
  if (children.isPending) {
    content = <LoadingState label="جارٍ تحميل الأطفال…" />;
  } else if (children.error) {
    content = (
      <ErrorState
        title="تعذّر تحميل الأطفال"
        description={children.error.message}
        action={
          <Button variant="outline" onClick={() => void children.refetch()}>
            إعادة المحاولة
          </Button>
        }
      />
    );
  } else if (children.data.length === 0) {
    content = <EmptyState icon={<Users />} title="لا يوجد أطفال مطابقون" />;
  } else {
    content = (
      <ul className={styles.cards} aria-label="الأطفال المسجّلون في النظام">
        {children.data.map((child) => {
          const details: ChildCardDetail[] = [];
          const facts = [child.age !== null ? `العمر: ${formatAge(child.age)}` : null, child.gender]
            .filter(Boolean)
            .join(' · ');
          if (facts) details.push({ icon: CalendarDays, label: facts });
          if (child.parentName) {
            details.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });
          }
          details.push({
            icon: BriefcaseMedical,
            label: `الأخصائي: ${child.specialistName ?? 'لم يُعيَّن بعد'}`,
          });
          return (
            <li key={child.id}>
              <ChildCard name={child.fullName} headingLevel={2} details={details} />
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className={styles.tab}>
      <SearchField
        label="ابحث باسم الطفل..."
        placeholder="ابحث باسم الطفل..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
        }}
      />
      {content}
    </div>
  );
}
