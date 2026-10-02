import { ArrowRight, BookOpen, Plus, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { EmptyState } from '@/components/shared/EmptyState';
import { PageBanner } from '@/components/shared/PageBanner';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { useRoleArea } from '@/hooks/useRoleArea';
import { toIsoDateString } from '@/utils/dateFormat';

import { PlanCard } from '../components/PlanCard';
import { PlanFormDialog } from '../components/PlanFormDialog';
import { PLAN_EDITOR_ROLES } from '../labels';
import { findPlanChild, MOCK_EDUCATION_PLANS } from '../mock/educationPlans.mock';
import { toLines, type EducationPlanFormValues } from '../schemas/educationPlan';
import type { EducationPlan } from '../types';

import styles from './ChildPlansPage.module.css';

const LOCAL_ONLY = 'نسخة للواجهة فقط: لن تُحفظ الخطة بعد تحديث الصفحة.';

/**
 * Education plans for one child (Replit IEP page). Every role can view; Specialist and Admin
 * can add a plan locally (UI only — nothing is saved).
 */
export function ChildPlansPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const child = findPlanChild(role, childId);
  const canCreate = (PLAN_EDITOR_ROLES as readonly string[]).includes(role);
  const [plans, setPlans] = useState<readonly EducationPlan[]>(
    () => MOCK_EDUCATION_PLANS[childId] ?? [],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  if (!child) {
    return (
      <div className={styles.page}>
        <Link to={paths.children} className={styles.backLink}>
          <ArrowRight aria-hidden="true" />
          العودة إلى الأطفال
        </Link>
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={
            <Link to={paths.children} className={getButtonClassName()}>
              العودة إلى الأطفال
            </Link>
          }
        />
      </div>
    );
  }

  const openForm = () => {
    setIsFormOpen(true);
  };

  // TEMPORARY local behaviour until training plans are integrated.
  const handleCreate = (values: EducationPlanFormValues) => {
    const plan: EducationPlan = {
      id: `local-${crypto.randomUUID()}`,
      title: values.title,
      status: values.status,
      startedAt: toIsoDateString(new Date()),
      goals: toLines(values.goals),
      strategies: toLines(values.strategies),
      activitiesCompleted: 0,
      activitiesTotal: 0,
      isLocal: true,
      ...(values.reviewDate ? { reviewDate: values.reviewDate } : {}),
      ...(values.notes ? { notes: values.notes } : {}),
    };
    setPlans((current) => [plan, ...current]);
    setLastCreated(plan.title);
    setIsFormOpen(false);
  };

  const createButton = (
    <Button variant="outline" iconStart={<Plus aria-hidden="true" />} onClick={openForm}>
      خطة جديدة
    </Button>
  );

  return (
    <div className={styles.page}>
      <Link to={paths.childProfile(child.id)} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى ملف {child.name}
      </Link>

      <PageBanner
        tone="violet"
        title="الخطط التعليمية"
        subtitle={`للطفل: ${child.name}`}
        actions={canCreate ? createButton : undefined}
        aside={
          <span className={styles.bannerIcon} aria-hidden="true">
            <BookOpen />
          </span>
        }
      />

      {lastCreated ? (
        <Alert tone="success">
          {`تمت إضافة الخطة «${lastCreated}».`} {LOCAL_ONLY}
        </Alert>
      ) : null}

      {plans.length === 0 ? (
        <EmptyState
          icon={<BookOpen />}
          title="لا توجد خطط تعليمية بعد"
          description={
            canCreate
              ? 'أنشئ خطة تعليمية فردية لهذا الطفل.'
              : 'لم يتم إنشاء أي خطة تعليمية لهذا الطفل حتى الآن.'
          }
          action={
            canCreate ? (
              <Button iconStart={<Plus aria-hidden="true" />} onClick={openForm}>
                خطة جديدة
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className={styles.grid} aria-label="قائمة الخطط التعليمية">
          {plans.map((plan) => (
            <li key={plan.id}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>
      )}

      {canCreate ? (
        <PlanFormDialog
          isOpen={isFormOpen}
          childName={child.name}
          onClose={() => {
            setIsFormOpen(false);
          }}
          onCreate={handleCreate}
        />
      ) : null}
    </div>
  );
}
