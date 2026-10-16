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

/**
 * Real profile facts for one child: age and gender from the children list, and the counts the
 * server sends for the child (`GET Parent/{childId}`: tests, games, reports). A count is shown
 * only once the server has sent it — never a placeholder 0.
 */
function childDetails(child: ChildSummary, counts: ReturnType<typeof useParentChildDetail>) {
  const details: ChildCardDetail[] = [];
  if (child.age !== null) details.push({ icon: Cake, label: `العمر: ${formatAge(child.age)}` });
  if (child.gender) details.push({ icon: Smile, label: `الجنس: ${child.gender}` });
  const detail = counts.data;
  if (!detail) return details;
  if (detail.testsCount !== null) {
    details.push({ icon: ClipboardList, label: `الاختبارات: ${detail.testsCount.toString()}` });
  }
  if (detail.gamesCount !== null) {
    details.push({ icon: Gamepad2, label: `الألعاب: ${detail.gamesCount.toString()}` });
  }
  if (detail.reportsCount !== null) {
    details.push({ icon: FileText, label: `التقارير: ${detail.reportsCount.toString()}` });
  }
  return details;
}

/** The whole card opens the child's profile (client revision 2026-10: no separate button). */
function ChildPreviewCard({ child }: { child: ChildSummary }) {
  const counts = useParentChildDetail(child.id);
  return (
    <Link
      to={buildParentChildProfilePath(child.id)}
      className={styles.cardLink}
      aria-label={`ملف ${child.fullName}`}
    >
      <ChildCard name={child.fullName} details={childDetails(child, counts)} />
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
