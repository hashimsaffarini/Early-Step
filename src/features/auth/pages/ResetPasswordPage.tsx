import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheck, KeyRound, Lock, Mail } from 'lucide-react';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useLocation } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { FormField, Input, PasswordInput } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';

import { useResetPasswordMutation } from '../api/authMutations';
import { AuthSplitShell } from '../components/AuthSplitShell';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
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
  email: 'البريد الإلكتروني',
  code: 'رمز التحقق',
  password: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور',
  submit: 'تعيين كلمة المرور',
  backToLogin: 'العودة لتسجيل الدخول',
  successTitle: 'تم تغيير كلمة المرور',
  successText: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.',
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
  const resetMutation = useResetPasswordMutation();
  const strengthId = useId();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: email ?? '', code: '', password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit((values) => {
    resetMutation.mutate({
      email: values.email,
      code: values.code,
      newPassword: values.password,
      confirmPassword: values.confirmPassword,
    });
  });

  const panel = {
    panelTitle: COPY.panelTitle,
    panelHighlight: COPY.panelHighlight,
    panelText: COPY.panelText,
    panelPoints: COPY.panelPoints,
    backLink: { to: ROUTE_PATHS.forgotPassword, label: COPY.requestNewCode },
  };

  if (resetMutation.isSuccess) {
    return (
      <AuthSplitShell {...panel}>
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            <CircleCheck />
          </span>
          <h1 className={styles.successTitle}>{COPY.successTitle}</h1>
          <p className={styles.successText}>{COPY.successText}</p>
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
        <ApiErrorAlert error={resetMutation.error} />
        <FormField label={COPY.email} error={errors.email?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('email')}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              leadingIcon={<Mail />}
              inputSize="lg"
            />
          )}
        </FormField>
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
        <Button type="submit" size="lg" fullWidth isLoading={resetMutation.isPending}>
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
