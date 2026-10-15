/**
 * Password rules taken from the Replit prototype (register / reset screens).
 * Shared by registration, password reset and Super Admin staff creation (the server validates too).
 */
export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordCriterion {
  id: 'length' | 'uppercase' | 'lowercase' | 'digit' | 'symbol';
  label: string;
  /** Latin example rendered in an LTR isolate so RTL doesn't reorder it. */
  example?: string;
  test: (password: string) => boolean;
}

export const PASSWORD_CRITERIA: readonly PasswordCriterion[] = [
  {
    id: 'length',
    label: `${MIN_PASSWORD_LENGTH} أحرف على الأقل`,
    test: (p) => p.length >= MIN_PASSWORD_LENGTH,
  },
  { id: 'uppercase', label: 'حرف إنجليزي كبير', example: 'A-Z', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'حرف إنجليزي صغير', example: 'a-z', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'رقم', example: '0-9', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'رمز خاص', example: '!@#$%', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export const PASSWORD_STRENGTH_LABELS: Record<PasswordStrengthLevel, string> = {
  weak: 'ضعيفة',
  medium: 'متوسطة',
  strong: 'قوية',
};

const MEDIUM_MIN_SCORE = 3;

export interface PasswordEvaluation {
  /** Number of criteria met (0..PASSWORD_CRITERIA.length). */
  score: number;
  level: PasswordStrengthLevel;
  passed: Record<PasswordCriterion['id'], boolean>;
  meetsAll: boolean;
}

export function evaluatePassword(password: string): PasswordEvaluation {
  const passed = Object.fromEntries(
    PASSWORD_CRITERIA.map((criterion) => [criterion.id, criterion.test(password)]),
  ) as PasswordEvaluation['passed'];
  const score = Object.values(passed).filter(Boolean).length;
  const meetsAll = score === PASSWORD_CRITERIA.length;
  const level: PasswordStrengthLevel = meetsAll
    ? 'strong'
    : score >= MEDIUM_MIN_SCORE
      ? 'medium'
      : 'weak';
  return { score, level, passed, meetsAll };
}
