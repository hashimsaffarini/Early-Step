import { mediaKeys } from '@/services/media/localMedia';
import type { ReactNode, Ref } from 'react';

import { CHOICE_HINTS, QuestionProgress } from '@/components/players';
import { ServerImage } from '@/components/shared/ServerImage';

import type { GameQuestion, GameTemplate } from '../types';

import styles from './Game.module.css';

export interface GameStageProps {
  template: GameTemplate;
  question: GameQuestion;
  index: number;
  total: number;
  /** Receives focus when the next challenge appears. */
  promptRef?: Ref<HTMLHeadingElement>;
  /** The challenge (one question's interaction). */
  children: ReactNode;
  /** Next / finish controls. */
  footer: ReactNode;
}

/**
 * The shared Early Step game stage: the game's identity, progress, the real question (text and
 * image from the server), a short instruction, the challenge and the controls.
 */
export function GameStage({
  template,
  question,
  index,
  total,
  promptRef,
  children,
  footer,
}: GameStageProps) {
  const Icon = template.icon;
  const instruction = template.questionTypes.includes(question.type)
    ? template.instruction
    : CHOICE_HINTS[question.type];
  return (
    <section className={styles.stage} data-tone={template.tone} aria-label={template.name}>
      <header className={styles.stageHead}>
        <span className={styles.stageIcon} aria-hidden="true">
          <Icon />
        </span>
        <div className={styles.stageTitles}>
          <p className={styles.stageName}>{template.name}</p>
          <p className={styles.stagePurpose}>{template.purpose}</p>
        </div>
      </header>
      <QuestionProgress current={index + 1} total={total} noun="المستوى" />
      <div className={styles.prompt}>
        <h2 ref={promptRef} tabIndex={-1} className={styles.promptText}>
          {question.text || 'مهمة جديدة'}
        </h2>
        <ServerImage
          path={question.imageUrl}
          mediaKey={mediaKeys.question(question.id)}
          alt=""
          className={styles.promptImage}
        />
        <p className={styles.instruction}>{instruction}</p>
      </div>
      {children}
      <div className={styles.footer}>{footer}</div>
    </section>
  );
}
