import { UserX } from 'lucide-react';
import { useReducer } from 'react';
import { Link, useParams } from 'react-router';

import { PlayerShell } from '@/components/players';
import { EmptyState } from '@/components/shared/EmptyState';
import { getButtonClassName } from '@/components/ui/Button';
import { useRoleArea } from '@/hooks/useRoleArea';

import { AssessmentIntro } from '../components/AssessmentIntro';
import { AssessmentResults } from '../components/AssessmentResults';
import { AssessmentSectionRunner } from '../components/AssessmentSectionRunner';
import { SectionComplete } from '../components/SectionComplete';
import { SectionProgress } from '../components/SectionProgress';
import { ASSESSMENT_SECTIONS } from '../content/sections';
import { findAssessmentChild } from '../mock/assessmentChildren.mock';
import {
  assessmentFlowReducer,
  countCompletedSections,
  INITIAL_ASSESSMENT_FLOW,
  isSectionCompleted,
  type AssessmentFlowState,
} from '../state/assessmentFlow';
import type { AssessmentSectionKey } from '../types';

const TITLE = 'التقييم الأولي';
const EMOJI = '🎯';

const CONTINUE_LABELS = {
  section: 'القسم التالي',
  results: 'عرض النتيجة',
  intro: 'العودة إلى الأقسام',
} as const;

function continueLabel(state: AssessmentFlowState): string {
  const next = assessmentFlowReducer(state, { type: 'continue' }).view.type;
  return next === 'section' || next === 'results' ? CONTINUE_LABELS[next] : CONTINUE_LABELS.intro;
}

function findSection(key: AssessmentSectionKey) {
  return ASSESSMENT_SECTIONS.find((section) => section.key === key);
}

/**
 * Initial assessment (Replit `/assessment/:id`) — full-screen, light child style.
 * UI only: local state, TEMPORARY mock child, nothing is sent or saved.
 */
export function AssessmentPage() {
  const { childId = '' } = useParams();
  const { paths } = useRoleArea();
  const [state, dispatch] = useReducer(assessmentFlowReducer, INITIAL_ASSESSMENT_FLOW);
  const child = findAssessmentChild(childId);

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

  const { view } = state;
  const profilePath = paths.childProfile(child.id);

  const renderView = () => {
    switch (view.type) {
      case 'intro':
        return (
          <AssessmentIntro
            childName={child.name}
            sections={ASSESSMENT_SECTIONS}
            isCompleted={(key) => isSectionCompleted(state, key)}
            onStartSection={(section) => {
              dispatch({ type: 'startSection', section });
            }}
            onPlayAll={() => {
              dispatch({ type: 'playAll' });
            }}
          />
        );
      case 'section': {
        const section = findSection(view.section);
        return section ? (
          <AssessmentSectionRunner
            key={section.key}
            section={section}
            onFinish={(answered) => {
              dispatch({ type: 'finishSection', section: section.key, answered });
            }}
            onExit={() => {
              dispatch({ type: 'backToIntro' });
            }}
          />
        ) : null;
      }
      case 'sectionDone':
        return (
          <SectionComplete
            sectionTitle={findSection(view.section)?.title ?? ''}
            answered={state.completed[view.section] ?? 0}
            continueLabel={continueLabel(state)}
            onContinue={() => {
              dispatch({ type: 'continue' });
            }}
          />
        );
      case 'results':
        return (
          <AssessmentResults
            childName={child.name}
            sections={ASSESSMENT_SECTIONS}
            answered={state.completed}
            profilePath={profilePath}
          />
        );
    }
  };

  return (
    <PlayerShell
      exitTo={profilePath}
      title={`${TITLE} · ${child.name}`}
      category="attention"
      emoji={EMOJI}
      width={view.type === 'intro' ? 'wide' : 'player'}
      end={
        <SectionProgress
          completed={countCompletedSections(state)}
          total={ASSESSMENT_SECTIONS.length}
        />
      }
    >
      {renderView()}
    </PlayerShell>
  );
}
