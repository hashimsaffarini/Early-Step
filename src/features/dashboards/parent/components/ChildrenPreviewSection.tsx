import { ArrowLeft, Cake, ClipboardList, FileText, Gamepad2, Smile, Users } from 'lucide-react';
import { Link } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { getButtonClassName } from '@/components/ui/Button';
import { buildParentChildProfilePath, ROUTE_PATHS } from '@/constants/routes';
import { useParentChildDetail } from '@/hooks/api/childResources';
import type { ChildSummary } from '@/services/api/childrenLists';
import { formatAge } from '@/utils/age';

import styles from './ChildrenPreviewSection.module.css';

const HEADING_ID = 'parent-children-title';

/** Age and gender from the children list (`GET Parent/GetMyChildren`). */
function childDetails(child: ChildSummary): ChildCardDetail[] {
  const details: ChildCardDetail[] = [];
  if (child.age !== null) details.push({ icon: Cake, label: `العمر: ${formatAge(child.age)}` });
  if (child.gender) details.push({ icon: Smile, label: `الجنس: ${child.gender}` });
  return details;
}

/**
 * The counts the server sends for the child (`GET Parent/{childId}`: tests, games, reports), as a
 * compact row of numbers. A count is shown only once the server has sent it — never a placeholder.
 */
function ChildCounts({ childId }: { childId: string }) {
  const { data } = useParentChildDetail(childId);
  if (!data) return null;
  const counts = [
    { label: 'الاختبارات', value: data.testsCount, icon: ClipboardList },
    { label: 'الألعاب', value: data.gamesCount, icon: Gamepad2 },
    { label: 'التقارير', value: data.reportsCount, icon: FileText },
  ].filter((count) => count.value !== null);
  if (counts.length === 0) return null;
  return (
    <dl className={styles.counts}>
      {counts.map((count) => (
        <div key={count.label} className={styles.count}>
          <dt className={styles.countLabel}>
            <count.icon aria-hidden="true" />
            {count.label}
          </dt>
          <dd className={styles.countValue}>{count.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The whole card opens the child's profile (client revision 2026-10: no separate button). */
function ChildPreviewCard({ child }: { child: ChildSummary }) {
  return (
    <Link
      to={buildParentChildProfilePath(child.id)}
      className={styles.cardLink}
      aria-label={`ملف ${child.fullName}`}
    >
      <ChildCard name={child.fullName} details={childDetails(child)}>
        <ChildCounts childId={child.id} />
      </ChildCard>
    </Link>
  );
}

export interface ChildrenPreviewSectionProps {
  children: readonly ChildSummary[];
}

export function ChildrenPreviewSection({ children }: ChildrenPreviewSectionProps) {
  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      <SectionHeader
        id={HEADING_ID}
        title="أطفالي"
        icon={Users}
        action={
          <Link
            to={ROUTE_PATHS.parentChildren}
            className={getButtonClassName({ variant: 'ghost', size: 'sm' })}
          >
            عرض الكل
            <ArrowLeft aria-hidden="true" />
          </Link>
        }
      />
      <ul className={styles.grid}>
        {children.map((child) => (
          <li key={child.id}>
            <ChildPreviewCard child={child} />
          </li>
        ))}
      </ul>
    </section>
  );
}
