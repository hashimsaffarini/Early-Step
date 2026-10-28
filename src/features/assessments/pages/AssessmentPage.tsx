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
import { useAssessmentCategories } from '../api/assessmentQueries';
import { AssessmentCategoryPicker, PLAY_ALL } from '../components/AssessmentCategoryPicker';
import { AssessmentQuestionRunner, type RunProgress } from '../components/AssessmentQuestionRunner';
import { AssessmentResults } from '../components/AssessmentResults';
import { isAnswerable, categoryProgress } from '../state/assessmentRun';

const TITLE = 'التقييم الأولي';
const EMOJI = '🎯';

/**
 * Initial assessment (Replit `/assessment/:id`) — full-screen, light child style.
 * Parent only: start all categories → answer each question → complete (Swagger
 * `initial-assessment/*`). The flow ends with the submission; the saved result is for staff
 * (product decision 2026-10-14).
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

const addAll = (set: ReadonlySet<string>, ids: readonly string[]) => new Set([...set, ...ids]);

/** One assessment over all categories. Returning to the intro preserves answers in this visit. */
function ParentAssessment({ childId }: { childId: string }) {
  const { paths } = useRoleArea();
  const children = useChildrenForRole('Parent');
  const categories = useAssessmentCategories();
  const start = useStartAssessment();
  const complete = useCompleteAssessment();
  const [isRunning, setIsRunning] = useState(false);
  const [run, setRun] = useState(0);
  const [answered, setAnswered] = useState<ReadonlySet<string>>(new Set());
  const [isFinished, setIsFinished] = useState(false);

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
  const allQuestions = assessment?.questions ?? [];
  const backToProfile = (
    <Link to={profilePath} className={getButtonClassName()}>
      العودة إلى ملف الطفل
    </Link>
  );

  const play = () => {
    setRun((count) => count + 1);
    setIsRunning(true);
  };

  const select = () => {
    if (assessment) play();
    else start.mutate(childId, { onSuccess: play });
  };

  const endRun = (progress: RunProgress) => {
    const nextAnswered = addAll(answered, progress.answered);
    setAnswered(nextAnswered);
    setIsRunning(false);
    if (assessment && allQuestions.every((question) => nextAnswered.has(question.id))) {
      setIsFinished(true);
      complete.mutate(assessment.assessmentId);
    }
  };

  const renderCompletion = (assessmentId: string | undefined) => {
    if (complete.isSuccess) {
      return (
        <AssessmentResults
          childName={child.fullName}
          answered={answered.size}
          profilePath={profilePath}
        />
      );
    }
    if (complete.isError && assessmentId) {
      return (
        <div>
          <ApiErrorAlert error={complete.error} />
          <Button
            size="lg"
            iconStart={<RotateCcw aria-hidden="true" />}
            onClick={() => {
              complete.mutate(assessmentId);
            }}
          >
            إعادة محاولة إنهاء التقييم
          </Button>
        </div>
      );
    }
    return <LoadingState label="جارٍ إرسال التقييم…" />;
  };

  const renderBody = () => {
    if (isFinished) return renderCompletion(assessment?.assessmentId);
    if (assessment && allQuestions.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardX />}
          title="لا تتوفر أسئلة التقييم من الخادم حالياً"
          description="لم يُرسل الخادم أي سؤال لهذا التقييم. حاول لاحقاً أو تواصل مع إدارة المنصة."
          action={backToProfile}
        />
      );
    }
    if (assessment && allQuestions.some((question) => !isAnswerable(question))) {
      return (
        <EmptyState
          icon={<ClipboardX />}
          title="التقييم يحتاج إلى استكمال محتواه"
          description="يوجد سؤال بلا خيارات أو من نوع غير مدعوم. يُرجى التواصل مع إدارة المنصة لاستكماله قبل بدء الإجابة عن التقييم."
          action={backToProfile}
        />
      );
    }
    if (!assessment || !isRunning) {
      return (
        <AssessmentCategoryPicker
          childName={child.fullName}
          cards={(categories.data ?? []).map((category) => ({
            category,
            progress: assessment ? categoryProgress(allQuestions, category, answered) : null,
          }))}
          isLoading={categories.isPending}
          loadError={categories.error}
          onRetry={() => void categories.refetch()}
          startError={start.error}
          pendingKey={start.isPending ? PLAY_ALL : null}
          notice={null}
          exitAction={backToProfile}
          onSelect={select}
        />
      );
    }
    const questions = allQuestions.filter((question) => !answered.has(question.id));
    return (
      <AssessmentQuestionRunner
        key={run}
        assessmentId={assessment.assessmentId}
        questions={questions}
        finishLabel="إنهاء التقييم"
        onFinished={endRun}
        onExit={endRun}
      />
    );
  };

  return (
    <PlayerShell {...shell} title={title} width={isRunning ? 'player' : 'wide'}>
      {renderBody()}
    </PlayerShell>
  );
}
