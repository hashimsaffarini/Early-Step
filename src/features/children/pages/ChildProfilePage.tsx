import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  FileText,
  ListChecks,
  ServerOff,
  UserX,
  NotebookPen,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import type { AreaRole } from '@/constants/routes';
import { useChildPlanActivities } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';
import type { ChildSummary } from '@/services/api/childrenLists';

import { useDeleteChild } from '../api/childrenQueries';
import { ChildFormDialog } from '../components/ChildFormDialog';
import { ActivitiesTab } from '../components/profile/ActivitiesTab';
import { AssessmentsTab } from '../components/profile/AssessmentsTab';
import { ChildProfileHeader, DELETE_BLOCKED } from '../components/profile/ChildProfileHeader';
import { OverviewTab } from '../components/profile/OverviewTab';
import { ReportsTab } from '../components/profile/ReportsTab';
import { TeacherFeedbackTab } from '../components/profile/TeacherFeedbackTab';
import { useChildProfile } from '../hooks/useChildProfile';

import { BACK_TO_CHILDREN } from './childrenCopy';
import styles from './ChildProfilePage.module.css';

type ProfileTab = 'overview' | 'assessments' | 'activities' | 'reports' | 'feedback';

const TAB_ITEMS: readonly TabItem<ProfileTab>[] = [
  { value: 'overview', label: 'نظرة عامة', icon: <Activity aria-hidden="true" size={16} /> },
  {
    value: 'assessments',
    label: 'التقييمات',
    icon: <ClipboardCheck aria-hidden="true" size={16} />,
  },
  { value: 'activities', label: 'الأنشطة', icon: <ListChecks aria-hidden="true" size={16} /> },
  { value: 'reports', label: 'التقرير', icon: <FileText aria-hidden="true" size={16} /> },
];

/** The specialist also reads the teacher's notes (the teacher writes them on their notes page). */
const SPECIALIST_TAB_ITEMS: readonly TabItem<ProfileTab>[] = [
  ...TAB_ITEMS,
  {
    value: 'feedback',
    label: 'ملاحظات المعلم',
    icon: <NotebookPen aria-hidden="true" size={16} />,
  },
];

function ProfileContent({ child, role }: { child: ChildSummary; role: AreaRole }) {
  const { paths } = useRoleArea();
  const navigate = useNavigate();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const deleteMutation = useDeleteChild();
  const isParent = role === 'Parent';
  // Product rule (2026-10-14): a child with saved activity results is not deleted.
  const plan = useChildPlanActivities(isParent ? child.id : undefined);
  const hasResults = plan.data?.some((activity) => activity.isCompleted) ?? false;
  // Until the plan is loaded we cannot tell, so delete stays off (never assume "no results").
  const isDeleteBlocked = !plan.isSuccess || hasResults;

  return (
    <>
      <ChildProfileHeader
        child={child}
        role={role}
        onEdit={
          isParent
            ? () => {
                setIsEditOpen(true);
              }
            : undefined
        }
        onDelete={
          isParent
            ? () => {
                setIsDeleteOpen(true);
              }
            : undefined
        }
        isDeleteBlocked={isDeleteBlocked}
      />
      {isParent && hasResults ? <p className={styles.deleteNote}>{DELETE_BLOCKED}</p> : null}
      {isParent && plan.isError ? (
        <p className={styles.deleteNote}>
          تعذّر التحقق من نتائج خطة الطفل، لذلك الحذف غير متاح الآن.
        </p>
      ) : null}
      {savedMessage ? <Alert tone="success">{savedMessage}</Alert> : null}
      <ApiErrorAlert error={deleteMutation.error} />
      <Tabs
        label="أقسام ملف الطفل"
        items={role === 'Specialist' ? SPECIALIST_TAB_ITEMS : TAB_ITEMS}
        value={tab}
        onChange={setTab}
        className={styles.tabs}
      >
        {tab === 'overview' ? (
          <OverviewTab
            childId={child.id}
            childName={child.fullName}
            canStartAssessment={isParent}
            onShowActivities={() => {
              setTab('activities');
            }}
            onShowReports={() => {
              setTab('reports');
            }}
          />
        ) : null}
        {tab === 'assessments' ? (
          <AssessmentsTab childId={child.id} childName={child.fullName} canStart={isParent} />
        ) : null}
        {tab === 'activities' ? <ActivitiesTab childId={child.id} role={role} /> : null}
        {tab === 'reports' ? <ReportsTab childId={child.id} /> : null}
        {tab === 'feedback' ? <TeacherFeedbackTab childId={child.id} /> : null}
      </Tabs>
      {isParent ? (
        <>
          <ChildFormDialog
            isOpen={isEditOpen}
            child={child}
            onClose={() => {
              setIsEditOpen(false);
            }}
            onSaved={() => {
              setIsEditOpen(false);
              setSavedMessage('تم حفظ بيانات الطفل.');
            }}
          />
          <ConfirmDialog
            isOpen={isDeleteOpen}
            title="حذف ملف الطفل"
            description={`سيتم حذف ملف «${child.fullName}» نهائياً. لا يمكن التراجع عن هذا الإجراء.`}
            confirmLabel="حذف"
            tone="danger"
            isConfirming={deleteMutation.isPending}
            onCancel={() => {
              setIsDeleteOpen(false);
            }}
            onConfirm={() => {
              deleteMutation.mutate(child.id, {
                onSuccess: () => {
                  setIsDeleteOpen(false);
                  void navigate(paths.children, { replace: true });
                },
                onError: () => {
                  setIsDeleteOpen(false);
                },
              });
            }}
          />
        </>
      ) : null}
    </>
  );
}

/**
 * Child profile for every role. Parent: `GET Parent/{childId}` (+ edit/delete); staff: the child
 * from their assigned list; tabs read plan activities and reports from the API.
 */
export function ChildProfilePage() {
  const { role, paths } = useRoleArea();
  const { childId = '' } = useParams();
  const profile = useChildProfile(role, childId);
  const backLabel = BACK_TO_CHILDREN[role];
  const backToList = (
    <Link to={paths.children} className={getButtonClassName()}>
      {backLabel}
    </Link>
  );

  let content: ReactNode;
  switch (profile.status) {
    case 'loading':
      content = <LoadingState label="جارٍ تحميل ملف الطفل…" />;
      break;
    case 'error':
      content = (
        <ErrorState
          title="تعذّر تحميل ملف الطفل"
          description={profile.error.message}
          action={
            <Button variant="outline" onClick={profile.retry}>
              إعادة المحاولة
            </Button>
          }
        />
      );
      break;
    case 'blocked':
      content = (
        <EmptyState
          icon={<ServerOff />}
          title="ملف الطفل غير متاح للمدير من الخادم"
          description="لا يوفّر الخادم حالياً بيانات ملف الطفل لحساب المدير."
          action={backToList}
        />
      );
      break;
    case 'not-found':
      content = (
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={backToList}
        />
      );
      break;
    case 'ready':
      content = <ProfileContent child={profile.child} role={role} />;
      break;
  }

  return (
    <div className={styles.page}>
      <Link to={paths.children} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        {backLabel}
      </Link>
      {content}
    </div>
  );
}
