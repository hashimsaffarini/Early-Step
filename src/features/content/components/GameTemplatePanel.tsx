import { CircleAlert, CircleCheck, Gamepad2 } from 'lucide-react';

import { resolveGameTemplate } from '@/components/games';
import { CHOICE_TYPE_LABELS } from '@/components/players';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Feedback';

import type { Question } from '../types';

import styles from './content.module.css';

export interface GameTemplatePanelProps {
  slug: string;
  questions: readonly Question[];
}

/**
 * A game's template (from its saved `slug`) and how its real questions fit it. Questions are never
 * rewritten: a question of another type still works in the game with the engine made for its type.
 */
export function GameTemplatePanel({ slug, questions }: GameTemplatePanelProps) {
  const template = resolveGameTemplate(slug);
  if (!template) {
    return (
      <Alert tone="info">
        لا يوجد قالب محدد لهذا النشاط، لذلك يلعبه الطفل بلوحة البحث البصري، أو الترتيب عندما يتطلب
        المستوى ذلك. لاختيار قالب، عدّل النشاط واختر «نوع اللعبة».
      </Alert>
    );
  }
  const others = questions.filter(
    (question) => question.type !== null && !template.questionTypes.includes(question.type),
  ).length;
  const fits = template.questionTypes.map((type) => CHOICE_TYPE_LABELS[type]).join('، ');
  return (
    <Card as="section" className={styles.templatePanel} aria-label="نوع اللعبة">
      <span className={styles.templateIcon} aria-hidden="true">
        <Gamepad2 />
      </span>
      <div className={styles.rowMain}>
        <p className={styles.rowTitle}>{`نوع اللعبة: ${template.name}`}</p>
        <p className={styles.muted}>{`أنواع الأسئلة المناسبة: ${fits}.`}</p>
        {others > 0 ? (
          <p className={styles.muted}>
            <CircleAlert aria-hidden="true" size={14} />{' '}
            {`${others.toString()} من الأسئلة من نوع آخر: تُعرض بالواجهة المناسبة لنوعها. للحصول على تجربة «${template.name}» كاملة أضف أسئلة من النوع المناسب.`}
          </p>
        ) : (
          <p className={styles.muted}>
            <CircleCheck aria-hidden="true" size={14} />{' '}
            {questions.length > 0
              ? 'كل الأسئلة مناسبة لهذا القالب.'
              : 'أضف أسئلة من النوع المناسب لتظهر في اللعبة.'}
          </p>
        )}
      </div>
    </Card>
  );
}
