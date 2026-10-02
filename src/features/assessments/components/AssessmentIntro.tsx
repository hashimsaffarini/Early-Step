import { CircleCheck, Play, RotateCcw, Sparkles } from 'lucide-react';

import { CategoryTile } from '@/components/shared/CategoryTile';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import type { AssessmentSection, AssessmentSectionKey } from '../types';

import styles from './AssessmentIntro.module.css';

export interface AssessmentIntroProps {
  childName: string;
  sections: readonly AssessmentSection[];
  isCompleted: (section: AssessmentSectionKey) => boolean;
  onStartSection: (section: AssessmentSectionKey) => void;
  onPlayAll: () => void;
}

/** Greeting + 2×2 section tiles + "play all" (Replit assessment intro). */
export function AssessmentIntro({
  childName,
  sections,
  isCompleted,
  onStartSection,
  onPlayAll,
}: AssessmentIntroProps) {
  return (
    <div className={styles.intro}>
      <div className={styles.greeting}>
        <span className={styles.greetingEmoji} aria-hidden="true">
          🎯
        </span>
        <h2 className={styles.greetingTitle}>{`مرحباً يا ${childName}!`}</h2>
        <p className={styles.greetingText}>
          لدينا أربعة ألعاب قصيرة. اختر لعبة لتبدأ، أو العب الكل بالترتيب. لا يوجد وقت محدد، خذ
          وقتك.
        </p>
      </div>

      <ul className={styles.grid} aria-label="أقسام التقييم">
        {sections.map((section) => {
          const completed = isCompleted(section.key);
          const titleId = `section-${section.key}-title`;
          return (
            <li key={section.key}>
              <Card
                as="article"
                className={cx(styles.tile, completed && styles.completedTile)}
                aria-labelledby={titleId}
              >
                <CategoryTile
                  category={section.category}
                  emoji={section.emoji}
                  size="lg"
                  shape="round"
                />
                <h3 id={titleId} className={styles.tileTitle}>
                  {section.title}
                </h3>
                <p className={styles.tileText}>{section.subtitle}</p>
                {completed ? (
                  <span className={styles.done}>
                    <CircleCheck aria-hidden="true" />
                    مكتمل
                  </span>
                ) : null}
                <Button
                  variant={completed ? 'outline' : 'primary'}
                  fullWidth
                  className={styles.playButton}
                  iconStart={
                    completed ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />
                  }
                  aria-label={`${completed ? 'إعادة' : 'ابدأ'} قسم ${section.title}`}
                  onClick={() => {
                    onStartSection(section.key);
                  }}
                >
                  {completed ? 'إعادة القسم' : 'ابدأ'}
                </Button>
              </Card>
            </li>
          );
        })}
      </ul>

      <Button
        variant="accent"
        size="lg"
        fullWidth
        className={styles.playAll}
        iconStart={<Sparkles aria-hidden="true" />}
        onClick={onPlayAll}
      >
        العب الكل بالترتيب
      </Button>
    </div>
  );
}
