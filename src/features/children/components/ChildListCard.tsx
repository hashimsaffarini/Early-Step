import { Cake, Smile, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { getButtonClassName } from '@/components/ui/Button';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ChildSummary } from '@/services/api/childrenLists';

import { childDetails } from './childDisplay';

export interface ChildListCardProps {
  child: ChildSummary;
  /** Staff see the parent's name; the parent's own list omits it. */
  showParent?: boolean;
}

/** Child card with the fields the API provides (name, age, gender, parent for staff). */
export function ChildListCard({ child, showParent = false }: ChildListCardProps) {
  const { paths } = useRoleArea();
  const details: ChildCardDetail[] = childDetails(child).map((detail) => ({
    icon: detail.kind === 'age' ? Cake : Smile,
    label: detail.label,
  }));
  if (showParent && child.parentName) {
    details.push({ icon: UserRound, label: `ولي الأمر: ${child.parentName}` });
  }

  return (
    <ChildCard
      name={child.fullName}
      details={details}
      footer={
        <Link
          to={paths.childProfile(child.id)}
          className={getButtonClassName({ variant: 'soft', fullWidth: true })}
          aria-label={`عرض ملف ${child.fullName}`}
        >
          عرض الملف
        </Link>
      }
    />
  );
}
