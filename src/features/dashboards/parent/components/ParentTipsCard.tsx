import { Lightbulb } from 'lucide-react';

import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { cx } from '@/utils/classNames';

import type { ParentTip } from '../types';

import styles from './ParentTipsCard.module.css';

const HEADING_ID = 'parent-tips-title';

export interface ParentTipsCardProps {
  tips: readonly ParentTip[];
}

/** General, non-medical guidance tiles (Replit "insights" card pattern). */
export function ParentTipsCard({ tips }: ParentTipsCardProps) {
  return (
    <Card as="section" className={styles.card} aria-labelledby={HEADING_ID}>
      <SectionHeader id={HEADING_ID} title="نصائح لك" icon={Lightbulb} iconTone="primary" />
      <ul className={styles.grid}>
        {tips.map((tip) => (
          <li key={tip.id} className={cx(styles.tip, styles[tip.tone])}>
            <span className={styles.tipIcon} aria-hidden="true">
              <tip.icon />
            </span>
            <h3 className={styles.tipTitle}>{tip.title}</h3>
            <p className={styles.tipText}>{tip.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
