import {
  ArrowRight,
  BriefcaseMedical,
  CalendarDays,
  ClipboardCheck,
  UserX,
  Users,
} from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router';

import { ChildCard, type ChildCardDetail } from '@/components/shared/ChildCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ADMIN_PATHS } from '@/constants/routes';
import { useAssessmentStatus } from '@/hooks/api/assessmentStatus';
import type { ChildSummary } from '@/services/api/childrenLists';
import { HTTP_STATUS } from '@/services/http/httpStatus';
import { formatAge } from '@/utils/age';

import { useAdminUser } from '../api/usersQueries';
import { AssignChildSpecialistDialog } from '../components/AssignChildSpecialistDialog';
import { AssignSpecialistButton } from '../components/ChildrenAssignmentList';
import { RoleBadge } from '../components/RoleBadge';

import styles from './users.module.css';

const BACK_LABEL = 'العودة إلى المستخدمين';

function childDetails(child: ChildSummary): ChildCardDetail[] {
  const details: ChildCardDetail[] = [];
  const facts = [child.age !== null ? `العمر: ${formatAge(child.age)}` : null, child.gender]
    .filter(Boolean)
    .join(' · ');
  if (facts) details.push({ icon: CalendarDays, label: facts });
  details.push({
    icon: BriefcaseMedical,
    label: `الأخصائي: ${child.specialistName ?? 'لم يُعيَّن بعد'}`,
  });
  return details;
}

/**
 * The child's initial-assessment result for the Admin (client revision 2026-10), from
 * `GET initial-assessment/{childId}/result` (Admin 200 / 404 before completion) — the real overall
 * percentage only, or why there is none. One cached request per child card.
 */
function AssessmentResultLine({ childId }: { childId: string }) {
  const status = useAssessmentStatus(childId);
  let text: ReactNode;
  switch (status.state) {
    case 'loading':
      text = 'جارٍ تحميل نتيجة التقييم الأولي…';
      break;
    case 'complete':
      text = (
        <>
          نتيجة التقييم الأولي: <bdi>{`${Math.round(status.result.overallScore).toString()}%`}</bdi>
        </>
      );
      break;
    case 'incomplete':
      text = 'لم يكتمل التقييم الأولي';
      break;
    case 'unavailable':
      text = 'نتيجة التقييم الأولي غير متاحة';
      break;
    case 'error':
      text = 'تعذّر تحميل نتيجة التقييم الأولي';
      break;
  }
  return (
    <p className={styles.assessmentLine} data-state={status.state}>
      <ClipboardCheck aria-hidden="true" />
      {text}
    </p>
  );
}

/**
 * Admin user detail (`GET Admin/users/{userId}`) with the parent's children, each with
 * «+ تعيين أخصائي» (client revision 2026-10).
 */
export function AdminUserDetailPage() {
  const { userId } = useParams();
  const user = useAdminUser(userId);
  const childrenHeadingId = useId();
  const [assigning, setAssigning] = useState<ChildSummary | null>(null);

  const backLink = (
    <Link to={ADMIN_PATHS.users} className={styles.backLink}>
      <ArrowRight aria-hidden="true" />
      {BACK_LABEL}
    </Link>
  );

  if (user.isPending) {
    return (
      <div className={styles.page}>
        {backLink}
        <LoadingState label="جارٍ تحميل بيانات المستخدم…" />
      </div>
    );
  }

  if (user.error) {
    const isMissing = user.error.status === HTTP_STATUS.NOT_FOUND;
    return (
      <div className={styles.page}>
        {backLink}
        {isMissing ? (
          <EmptyState
            icon={<UserX />}
            title="المستخدم غير موجود"
            action={
              <Link to={ADMIN_PATHS.users} className={getButtonClassName()}>
                {BACK_LABEL}
              </Link>
            }
          />
        ) : (
          <ErrorState
            title="تعذّر تحميل بيانات المستخدم"
            description={user.error.message}
            action={
              <Button variant="outline" onClick={() => void user.refetch()}>
                إعادة المحاولة
              </Button>
            }
          />
        )}
      </div>
    );
  }

  const data = user.data;
  const isParent = data.role === 'Parent';

  return (
    <div className={styles.page}>
      {backLink}
      <Card className={styles.profile}>
        <div className={styles.profileHeader}>
          <Avatar name={data.name} size="lg" shape="circle" />
          <div className={styles.identity}>
            <h1 className={styles.name}>{data.name}</h1>
            {data.email ? (
              <bdi dir="ltr" className={styles.email}>
                {data.email}
              </bdi>
            ) : null}
          </div>
          <RoleBadge role={data.role} roleValue={data.roleValue} />
          {data.emailConfirmed === false ? <Badge tone="warning">البريد غير مؤكَّد</Badge> : null}
        </div>
        <dl className={styles.facts}>
          {data.childrenCount !== null ? (
            <div className={styles.fact}>
              <dt>عدد الأطفال</dt>
              <dd>{data.childrenCount}</dd>
            </div>
          ) : null}
        </dl>
      </Card>

      {isParent ? (
        <section className={styles.page} aria-labelledby={childrenHeadingId}>
          <SectionHeader id={childrenHeadingId} title="الأطفال" icon={Users} />
          {data.children.length === 0 ? (
            <EmptyState icon={<Users />} title="لم يُضِف ولي الأمر أطفالاً بعد" />
          ) : (
            <ul className={styles.childGrid} aria-label="أطفال ولي الأمر">
              {data.children.map((child) => (
                <li key={child.id}>
                  <ChildCard
                    name={child.fullName}
                    details={childDetails(child)}
                    children={<AssessmentResultLine childId={child.id} />}
                    footer={
                      <AssignSpecialistButton
                        child={child}
                        onClick={() => {
                          setAssigning(child);
                        }}
                      />
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {assigning ? (
        <AssignChildSpecialistDialog
          child={assigning}
          onClose={() => {
            setAssigning(null);
          }}
        />
      ) : null}
    </div>
  );
}
