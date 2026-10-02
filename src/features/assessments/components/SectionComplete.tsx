import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import { formatQuestionCount } from '../format';

import styles from './SectionComplete.module.css';

export interface SectionCompleteProps {
  sectionTitle: string;
  answered: number;
  /** Label of the next step: next section, back to sections, or the final screen. */
  continueLabel: string;
  onContinue: () => void;
}

/** Short celebration between sections (no score). */
export function SectionComplete({
  sectionTitle,
  answered,
  continueLabel,
  onContinue,
}: SectionCompleteProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <Card as="section" className={styles.done} aria-labelledby="section-complete-title">
      <span className={styles.emoji} aria-hidden="true">
        🌟
      </span>
      <h2 id="section-complete-title" ref={headingRef} tabIndex={-1} className={styles.title}>
        {`أحسنت! أنهيت قسم ${sectionTitle}`}
      </h2>
      <p className={styles.text}>{`أجبت عن ${formatQuestionCount(answered)}.`}</p>
      <Button
        size="lg"
        className={styles.action}
        iconEnd={<ArrowLeft aria-hidden="true" />}
        onClick={onContinue}
      >
        {continueLabel}
      </Button>
    </Card>
  );
}
