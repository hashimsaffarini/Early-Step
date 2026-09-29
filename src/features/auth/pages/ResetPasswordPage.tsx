import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, KeyRound, Lock } from 'lucide-react';
import { useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { FormField, Input, PasswordInput } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';

import { AuthSplitShell } from '../components/AuthSplitShell';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { UI_ONLY_NOTICE } from '../constants';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/passwordRecovery';

import styles from './AuthForm.module.css';

/** Passed from the forgot-password screen via router state (never in the URL). */
export interface ResetPasswordLocationState {
  email: string;
}

const COPY = {
  panelTitle: 'اختر كلمة مرور',
  panelHighlight: 'قوية وآمنة',
  panelText: 'استخدم كلمة مرور يصعب تخمينها ولا تشاركها مع أحد.',
  panelPoints: [
    '8 أحرف على الأقل',
    'مزيج من الحروف والأرقام والرموز',
    'تجنّب استخدام كلمة مرور قديمة',
  ],
  requestNewCode: 'طلب رمز جديد',
  title: 'كلمة مرور جديدة',
  subtitleWithEmail: 'أدخل الرمز المرسل إلى',
  subtitle: 'أدخل رمز التحقق وكلمة المرور الجديدة',
  code: 'رمز التحقق',
  password: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور',
  submit: 'تعيين كلمة المرور',
  backToLogin: 'العودة لتسجيل الدخول',
  successTitle: 'تم التحقق من كلمة المرور الجديدة',
  successText: 'يمكنك الآن العودة إلى صفحة تسجيل الدخول.',
  login: 'تسجيل الدخول',
} as const;

function readEmail(state: unknown): string | null {
  if (
    typeof state === 'object' &&
    state !== null &&
    'email' in state &&
    typeof state.email === 'string'
  ) {
    return state.email;
  }
  return null;
}

export function ResetPasswordPage() {
  const email = readEmail(useLocation().state);
  const [isDone, setIsDone] = useState(false);
  const strengthId = useId();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { code: '', password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  // UI-only stage: nothing is saved or sent.
  const onSubmit = handleSubmit(() => {
    setIsDone(true);
  });

  const panel = {
    panelTitle: COPY.panelTitle,
    panelHighlight: COPY.panelHighlight,
    panelText: COPY.panelText,
    panelPoints: COPY.panelPoints,
    backLink: { to: ROUTE_PATHS.forgotPassword, label: COPY.requestNewCode },
  };

  if (isDone) {
    return (
      <AuthSplitShell {...panel}>
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            <CircleCheck />
          </span>
          <h1 className={styles.successTitle}>{COPY.successTitle}</h1>
          <p className={styles.successText}>{COPY.successText}</p>
          <Alert tone="info">{UI_ONLY_NOTICE}</Alert>
          <Link
            to={ROUTE_PATHS.login}
            className={getButtonClassName({ size: 'lg', fullWidth: true })}
          >
            {COPY.login}
          </Link>
        </div>
      </AuthSplitShell>
    );
  }

  return (
    <AuthSplitShell {...panel}>
      <h1 className={styles.pageTitle}>{COPY.title}</h1>
      <p className={styles.pageSubtitle}>
        {email ? (
          <>
            {COPY.subtitleWithEmail} <bdi>{email}</bdi>
          </>
        ) : (
          COPY.subtitle
        )}
      </p>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <FormField label={COPY.code} error={errors.code?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('code')}
              inputMode="numeric"
              autoComplete="one-time-code"
              className={styles.codeInput}
              leadingIcon={<KeyRound />}
              inputSize="lg"
            />
          )}
        </FormField>
        <div className={styles.fieldGroup}>
          <FormField label={COPY.password} error={errors.password?.message}>
            {(field) => (
              <PasswordInput
                {...field}
                {...register('password')}
                aria-describedby={[field['aria-describedby'], strengthId].filter(Boolean).join(' ')}
                autoComplete="new-password"
                leadingIcon={<Lock />}
                inputSize="lg"
              />
            )}
          </FormField>
          <PasswordStrengthMeter id={strengthId} password={password} />
        </div>
        <FormField label={COPY.confirmPassword} error={errors.confirmPassword?.message}>
          {(field) => (
            <PasswordInput
              {...field}
              {...register('confirmPassword')}
              autoComplete="new-password"
              leadingIcon={<Lock />}
              inputSize="lg"
            />
          )}
        </FormField>
        <Button type="submit" size="lg" fullWidth>
          {COPY.submit}
        </Button>
      </form>
      <p className={styles.footerLink}>
        <Link to={ROUTE_PATHS.login} className={styles.inlineLink}>
          {COPY.backToLogin}
        </Link>
      </p>
    </AuthSplitShell>
  );
}
