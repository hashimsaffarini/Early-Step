import { Activity, ArrowRight, ClipboardCheck, FileText, ListChecks, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { AreaRole } from '@/constants/routes';
import { useRoleArea } from '@/hooks/useRoleArea';

import { AssignActivityDialog } from '../components/AssignActivityDialog';
import { ActivitiesTab } from '../components/profile/ActivitiesTab';
import { AssessmentsTab } from '../components/profile/AssessmentsTab';
import { ChildProfileHeader } from '../components/profile/ChildProfileHeader';
import { OverviewTab } from '../components/profile/OverviewTab';
import { ReportsTab } from '../components/profile/ReportsTab';
import type { AssignableActivity } from '../mock/assignableActivities.mock';
import { getMockChildrenForRole } from '../mock/children.mock';
import { EMPTY_CHILD_PROFILE, MOCK_CHILD_PROFILES } from '../mock/childProfiles.mock';
import type { ChildProfileDetails, ChildRecord, PlanActivity } from '../types';

import { BACK_TO_CHILDREN } from './childrenCopy';
import styles from './ChildProfilePage.module.css';

type ProfileTab = 'overview' | 'assessments' | 'activities' | 'reports';

/** Router state passed by the children list so locally added (unsaved) children can open. */
export interface ChildProfileLocationState {
  child: ChildRecord;
}

function readLocalChild(state: unknown, childId: string): ChildRecord | undefined {
  if (typeof state !== 'object' || state === null || !('child' in state)) return undefined;
  const child = (state as Partial<ChildProfileLocationState>).child;
  return child?.id === childId && child.id.startsWith('local-') ? child : undefined;
}

/**
 * Resolves the child from the TEMPORARY mock roster visible to this role
 * (or the parent's local, unsaved child). A child outside the role's roster is not found.
 */
function useProfile(role: AreaRole): { child: ChildRecord; details: ChildProfileDetails } | null {
  const { childId = '' } = useParams();
  const state: unknown = useLocation().state;
  const mockChild = getMockChildrenForRole(role).find((child) => child.id === childId);
  if (mockChild)
    return { child: mockChild, details: MOCK_CHILD_PROFILES[childId] ?? EMPTY_CHILD_PROFILE };
  const localChild = role === 'Parent' ? readLocalChild(state, childId) : undefined;
  return localChild ? { child: localChild, details: EMPTY_CHILD_PROFILE } : null;
}

/**
 * Child profile for every role (Replit profile screen). UI only — local mock data.
 * Staff can assign games/tests locally; the parent views only.
 */
export function ChildProfilePage() {
  const { role, paths } = useRoleArea();
  const profile = useProfile(role);
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [localActivities, setLocalActivities] = useState<readonly PlanActivity[]>([]);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [lastAssigned, setLastAssigned] = useState<string | null>(null);

  const backLabel = BACK_TO_CHILDREN[role];
  const backLink = (
    <Link to={paths.children} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      {backLabel}
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
            <Link to={paths.children} className={getButtonClassName()}>
              {backLabel}
            </Link>
          }
        />
      </div>
    );
  }

  const { child, details } = profile;
  const activities = [...(details.plan?.activities ?? []), ...localActivities];
  const canAssign = role !== 'Parent';
  const openAssign = canAssign
    ? () => {
        setIsAssignOpen(true);
      }
    : undefined;

  // TEMPORARY local behaviour until training-plan assignment is integrated.
  const handleAssign = (activity: AssignableActivity) => {
    setLocalActivities((current) => [
      ...current,
      {
        id: `local-${activity.id}`,
        activityId: activity.id,
        title: activity.title,
        type: activity.type,
        category: activity.category,
        emoji: activity.emoji,
        isCompleted: false,
      },
    ]);
    setLastAssigned(activity.title);
  };

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
      count: activities.length,
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
      {lastAssigned ? (
        <Alert tone="success">{`تمت إضافة «${lastAssigned}» إلى أنشطة الطفل (محلياً فقط).`}</Alert>
      ) : null}
      <Tabs
        label="أقسام ملف الطفل"
        items={tabItems}
        value={tab}
        onChange={setTab}
        className={styles.tabs}
      >
        {tab === 'overview' ? (
          <OverviewTab
            childId={child.id}
            childName={child.name}
            details={details}
            onShowActivities={() => {
              setTab('activities');
            }}
            onShowReports={() => {
              setTab('reports');
            }}
            onAssign={openAssign}
          />
        ) : null}
        {tab === 'assessments' ? (
          <AssessmentsTab
            assessments={details.assessments}
            childId={child.id}
            childName={child.name}
          />
        ) : null}
        {tab === 'activities' ? (
          <ActivitiesTab
            activities={activities}
            hasPlan={details.plan !== undefined}
            onAssign={openAssign}
          />
        ) : null}
        {tab === 'reports' ? <ReportsTab reports={details.reports} /> : null}
      </Tabs>
      {canAssign ? (
        <AssignActivityDialog
          isOpen={isAssignOpen}
          childName={child.name}
          assignedActivityIds={new Set(activities.map((activity) => activity.activityId))}
          onAssign={handleAssign}
          onClose={() => {
            setIsAssignOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
