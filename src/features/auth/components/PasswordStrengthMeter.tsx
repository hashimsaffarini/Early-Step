import { CircleCheck, CircleX } from 'lucide-react';

import { cx } from '@/utils/classNames';

import { evaluatePassword, PASSWORD_CRITERIA, PASSWORD_STRENGTH_LABELS } from '../schemas/password';

import styles from './PasswordStrengthMeter.module.css';

const LABELS = {
  strength: 'قوة كلمة المرور',
  criteria: 'شروط كلمة المرور',
  met: 'متحقق',
  unmet: 'غير متحقق',
} as const;

export interface PasswordStrengthMeterProps {
  password: string;
  id?: string;
}

/**
 * Replit's 5-segment strength bar + criteria checklist. The level is also
 * announced as text and each criterion has an icon + hidden state label, so
 * nothing depends on colour alone.
 */
export function PasswordStrengthMeter({ password, id }: PasswordStrengthMeterProps) {
  if (password.length === 0) return null;
  const { score, level, passed } = evaluatePassword(password);

  return (
    <div id={id} className={cx(styles.meter, styles[level])}>
      <div className={styles.segments} aria-hidden="true">
        {PASSWORD_CRITERIA.map((criterion, index) => (
          <span key={criterion.id} className={cx(styles.segment, index < score && styles.filled)} />
        ))}
      </div>
      <p className={styles.level} aria-live="polite">
        {LABELS.strength}: {PASSWORD_STRENGTH_LABELS[level]}
      </p>
      <ul className={styles.criteria} aria-label={LABELS.criteria}>
        {PASSWORD_CRITERIA.map((criterion) => {
          const isMet = passed[criterion.id];
          const Icon = isMet ? CircleCheck : CircleX;
          return (
            <li key={criterion.id} className={cx(styles.criterion, isMet && styles.met)}>
              <Icon aria-hidden="true" />
              <span>
                {criterion.label}
                {criterion.example ? (
                  <>
                    {' '}
                    <bdi dir="ltr">{`(${criterion.example})`}</bdi>
                  </>
                ) : null}
              </span>
              <span className="visually-hidden">({isMet ? LABELS.met : LABELS.unmet})</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
