import { ClipboardX, RotateCcw, UserX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { PlayerShell } from '@/components/players';
import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { useChildrenForRole } from '@/hooks/api/childResources';
import { useRoleArea } from '@/hooks/useRoleArea';

import { useCompleteAssessment, useStartAssessment } from '../api/assessmentMutations';
import { AssessmentIntro } from '../components/AssessmentIntro';
import { AssessmentQuestionRunner } from '../components/AssessmentQuestionRunner';
import { AssessmentResults } from '../components/AssessmentResults';

const TITLE = 'التقييم الأولي';
const EMOJI = '🎯';

/**
 * Initial assessment (Replit `/assessment/:id`) — full-screen, light child style.
 * Parent only: start → answer each question → complete (Swagger `initial-assessment/*`).
 * Shapes NOT LIVE-VERIFIED; no results endpoint (completion stays neutral).
 */
export function AssessmentPage() {
  const { childId = '' } = useParams();
  const { role, paths } = useRoleArea();
  const profilePath = paths.childProfile(childId);
  const shell = { exitTo: profilePath, category: 'attention' as const, emoji: EMOJI };

  if (role !== 'Parent') {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <EmptyState
          icon={<ClipboardX />}
          title="يبدأ ولي الأمر التقييم الأولي"
          description="يُجرى التقييم الأولي من حساب ولي أمر الطفل."
          action={
            <Link to={profilePath} className={getButtonClassName()}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      </PlayerShell>
    );
  }

  return <ParentAssessment childId={childId} />;
}

function ParentAssessment({ childId }: { childId: string }) {
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Parent');
  const start = useStartAssessment();
  const complete = useCompleteAssessment();
  const [answered, setAnswered] = useState<number | null>(null);

  const profilePath = paths.childProfile(childId);
  const shell = { exitTo: profilePath, category: 'attention' as const, emoji: EMOJI };

  if (children.isPending) {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <LoadingState />
      </PlayerShell>
    );
  }
  if (children.isError) {
    return (
      <PlayerShell {...shell} title={TITLE}>
        <ErrorState
          title="تعذّر تحميل بيانات الطفل"
          description={children.error.message}
          action={<Button onClick={() => void children.refetch()}>إعادة المحاولة</Button>}
        />
      </PlayerShell>
    );
  }

  const child = children.data.find((item) => item.id === childId);
  if (!child) {
    return (
      <PlayerShell exitTo={paths.children} title={TITLE} category="attention" emoji={EMOJI}>
        <EmptyState
          icon={<UserX />}
          title="لم يتم العثور على الطفل"
          description="قد يكون الرابط غير صحيح أو أن الملف غير متاح."
          action={
            <Link to={paths.children} className={getButtonClassName()}>
              العودة إلى قائمة الأطفال
            </Link>
          }
        />
      </PlayerShell>
    );
  }

  const title = `${TITLE} · ${child.fullName}`;
  const assessment = start.data;

  const finish = (count: number) => {
    setAnswered(count);
    if (assessment) complete.mutate(assessment.assessmentId);
  };

  const renderBody = () => {
    if (!assessment) {
      return (
        <AssessmentIntro
          childName={child.fullName}
          isStarting={start.isPending}
          error={start.error}
          onStart={() => {
            start.mutate(childId);
          }}
        />
      );
    }
    if (assessment.questions.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardX />}
          title="لا تتوفر أسئلة التقييم من الخادم حالياً"
          description="لم يُرسل الخادم أي سؤال لهذا التقييم. حاول لاحقاً أو تواصل مع إدارة المنصة."
          action={
            <Link to={profilePath} className={getButtonClassName()}>
              العودة إلى ملف الطفل
            </Link>
          }
        />
      );
    }
    if (answered === null) {
      return (
        <AssessmentQuestionRunner
          assessmentId={assessment.assessmentId}
          questions={assessment.questions}
          onFinished={finish}
        />
      );
    }
    if (complete.isSuccess) {
      return (
        <AssessmentResults
          childName={child.fullName}
          answered={answered}
          profilePath={profilePath}
        />
      );
    }
    if (complete.isError) {
      return (
        <div>
          <ApiErrorAlert error={complete.error} />
          <Button
            size="lg"
            iconStart={<RotateCcw aria-hidden="true" />}
            onClick={() => {
              complete.mutate(assessment.assessmentId);
            }}
          >
            إعادة محاولة إنهاء التقييم
          </Button>
        </div>
      );
    }
    return <LoadingState label="جارٍ إرسال التقييم…" />;
  };

  return (
    <PlayerShell {...shell} title={title} width={assessment ? 'player' : 'wide'}>
      {renderBody()}
    </PlayerShell>
  );
}
