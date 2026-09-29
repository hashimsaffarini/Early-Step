import { ChildrenPreviewSection } from '../components/ChildrenPreviewSection';
import { ParentStatsGrid } from '../components/ParentStatsGrid';
import { ParentTipsCard } from '../components/ParentTipsCard';
import { ParentWelcomeBanner } from '../components/ParentWelcomeBanner';
import { RecentActivityCard } from '../components/RecentActivityCard';
import {
  MOCK_PARENT_ACTIVITY,
  MOCK_PARENT_CHILDREN,
  MOCK_PARENT_STATS,
  PARENT_TIPS,
} from '../mock/parentDashboard.mock';

import styles from './ParentDashboardPage.module.css';

export interface ParentDashboardPageProps {
  /** Display name of the signed-in parent (temporary mock until auth exists). */
  parentName: string;
}

/**
 * Parent dashboard (UI only). All content comes from the isolated mock module —
 * replace with API data when the backend is integrated.
 */
export function ParentDashboardPage({ parentName }: ParentDashboardPageProps) {
  return (
    <div className={styles.page}>
      <ParentWelcomeBanner parentName={parentName} />
      <ParentStatsGrid stats={MOCK_PARENT_STATS} />
      <div className={styles.columns}>
        <ChildrenPreviewSection children={MOCK_PARENT_CHILDREN} />
        <RecentActivityCard items={MOCK_PARENT_ACTIVITY} />
      </div>
      <ParentTipsCard tips={PARENT_TIPS} />
    </div>
  );
}
