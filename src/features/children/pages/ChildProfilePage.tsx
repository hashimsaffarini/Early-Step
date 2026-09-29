import { Activity, ArrowRight, ClipboardCheck, FileText, ListChecks, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { ROUTE_PATHS } from '@/constants/routes';

import { ActivitiesTab } from '../components/profile/ActivitiesTab';
import { AssessmentsTab } from '../components/profile/AssessmentsTab';
import { ChildProfileHeader } from '../components/profile/ChildProfileHeader';
import { OverviewTab } from '../components/profile/OverviewTab';
import { ReportsTab } from '../components/profile/ReportsTab';
import { EMPTY_CHILD_PROFILE, MOCK_CHILD_PROFILES } from '../mock/childProfiles.mock';
import { MOCK_PARENT_CHILDREN_LIST } from '../mock/parentChildren.mock';
import type { ChildProfileDetails, ParentChild } from '../types';

import styles from './ChildProfilePage.module.css';

type ProfileTab = 'overview' | 'assessments' | 'activities' | 'reports';

const BACK_LABEL = 'العودة إلى أطفالي';

/** Router state passed by the children list so locally added (unsaved) children can open. */
export interface ChildProfileLocationState {
  child: ParentChild;
}

function readLocalChild(state: unknown, childId: string): ParentChild | undefined {
  if (typeof state !== 'object' || state === null || !('child' in state)) return undefined;
  const child = (state as Partial<ChildProfileLocationState>).child;
  return child?.id === childId ? child : undefined;
}

/** Resolves the child from the TEMPORARY mock list (or the local, unsaved child). */
function useProfile(): { child: ParentChild; details: ChildProfileDetails } | null {
  const { childId = '' } = useParams();
  const state: unknown = useLocation().state;
  const mockChild = MOCK_PARENT_CHILDREN_LIST.find((child) => child.id === childId);
  if (mockChild)
    return { child: mockChild, details: MOCK_CHILD_PROFILES[childId] ?? EMPTY_CHILD_PROFILE };
  const localChild = readLocalChild(state, childId);
  return localChild ? { child: localChild, details: EMPTY_CHILD_PROFILE } : null;
}

/** Child profile (Replit profile screen). UI only — local mock data, view only. */
export function ChildProfilePage() {
  const profile = useProfile();
  const [tab, setTab] = useState<ProfileTab>('overview');

  const backLink = (
    <Link to={ROUTE_PATHS.parentChildren} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      {BACK_LABEL}
    </Link>
  );

  if (!profile) {
    return (
      <div className={styles.page}>
        {backLink}
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={
            <Link to={ROUTE_PATHS.parentChildren} className={getButtonClassName()}>
              {BACK_LABEL}
            </Link>
          }
        />
      </div>
    );
  }

  const { child, details } = profile;
  const tabItems: readonly TabItem<ProfileTab>[] = [
    { value: 'overview', label: 'نظرة عامة', icon: <Activity aria-hidden="true" size={16} /> },
    {
      value: 'assessments',
      label: 'التقييمات',
      count: details.assessments.length,
      icon: <ClipboardCheck aria-hidden="true" size={16} />,
    },
    {
      value: 'activities',
      label: 'الأنشطة',
      count: details.plan?.activities.length ?? 0,
      icon: <ListChecks aria-hidden="true" size={16} />,
    },
    {
      value: 'reports',
      label: 'التقارير',
      count: details.reports.length,
      icon: <FileText aria-hidden="true" size={16} />,
    },
  ];

  return (
    <div className={styles.page}>
      {backLink}
      <ChildProfileHeader child={child} details={details} />
      <Tabs
        label="أقسام ملف الطفل"
        items={tabItems}
        value={tab}
        onChange={setTab}
        className={styles.tabs}
      >
        {tab === 'overview' ? (
          <OverviewTab
            details={details}
            onShowActivities={() => {
              setTab('activities');
            }}
            onShowReports={() => {
              setTab('reports');
            }}
          />
        ) : null}
        {tab === 'assessments' ? <AssessmentsTab assessments={details.assessments} /> : null}
        {tab === 'activities' ? <ActivitiesTab plan={details.plan} /> : null}
        {tab === 'reports' ? <ReportsTab reports={details.reports} /> : null}
      </Tabs>
    </div>
  );
}
