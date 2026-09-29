import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { FormField, Input } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';

import { AuthSplitShell } from '../components/AuthSplitShell';
import { UI_ONLY_NOTICE } from '../constants';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/passwordRecovery';
import type { ResetPasswordLocationState } from './ResetPasswordPage';

import styles from './AuthForm.module.css';

const COPY = {
  panelTitle: 'لا تقلق،',
  panelHighlight: 'سنساعدك للعودة',
  panelText: 'أدخل بريدك الإلكتروني لاستعادة الوصول إلى حسابك.',
  panelPoints: [
    'خطوات بسيطة وسريعة',
    'لا داعي لتذكّر كلمة المرور القديمة',
    'يمكنك العودة لتسجيل الدخول في أي وقت',
  ],
  backToLogin: 'العودة لتسجيل الدخول',
  title: 'نسيت كلمة المرور؟',
  subtitle: 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور',
  email: 'البريد الإلكتروني',
  submit: 'إرسال رمز التحقق',
  rememberIt: 'تذكرت كلمة المرور؟',
  login: 'تسجيل الدخول',
  successTitle: 'تم استلام طلبك',
  successText: 'إذا كان البريد الإلكتروني مسجلاً، فسيتم إرسال تعليمات استعادة كلمة المرور.',
  enterCode: 'إدخال رمز التحقق',
  tryAnother: 'تجربة بريد إلكتروني آخر',
} as const;

const PANEL = {
  panelTitle: COPY.panelTitle,
  panelHighlight: COPY.panelHighlight,
  panelText: COPY.panelText,
  panelPoints: COPY.panelPoints,
  backLink: { to: ROUTE_PATHS.login, label: COPY.backToLogin },
} as const;

export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // UI-only stage: no email is sent; we only show the neutral confirmation state.
  const onSubmit = handleSubmit((values) => {
    setSubmittedEmail(values.email);
  });

  if (submittedEmail !== null) {
    const resetState: ResetPasswordLocationState = { email: submittedEmail };
    return (
      <AuthSplitShell {...PANEL}>
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            <MailCheck />
          </span>
          <h1 className={styles.successTitle}>{COPY.successTitle}</h1>
          <p className={styles.successText}>{COPY.successText}</p>
          <Alert tone="info">{UI_ONLY_NOTICE}</Alert>
          <div className={styles.actions}>
            <Link
              to={ROUTE_PATHS.resetPassword}
              state={resetState}
              className={getButtonClassName({ size: 'lg', fullWidth: true })}
            >
              {COPY.enterCode}
            </Link>
            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                reset();
                setSubmittedEmail(null);
              }}
            >
              {COPY.tryAnother}
            </Button>
          </div>
        </div>
      </AuthSplitShell>
    );
  }

  return (
    <AuthSplitShell {...PANEL}>
      <h1 className={styles.pageTitle}>{COPY.title}</h1>
      <p className={styles.pageSubtitle}>{COPY.subtitle}</p>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
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
        <Button type="submit" size="lg" fullWidth iconStart={<Sparkles aria-hidden="true" />}>
          {COPY.submit}
        </Button>
      </form>
      <p className={styles.footerLink}>
        {COPY.rememberIt}{' '}
        <Link to={ROUTE_PATHS.login} className={styles.inlineLink}>
          {COPY.login}
        </Link>
      </p>
    </AuthSplitShell>
  );
}
