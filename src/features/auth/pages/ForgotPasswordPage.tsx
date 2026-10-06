import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';
import { HTTP_STATUS } from '@/services/http/httpStatus';

import { useForgotPasswordMutation } from '../api/authMutations';
import { AuthSplitShell } from '../components/AuthSplitShell';
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

  const forgotMutation = useForgotPasswordMutation();

  /*
   * The backend answers 400 "Email not found." for unknown emails. The UI shows the same neutral
   * confirmation either way so it does not reveal which emails have accounts.
   */
  const onSubmit = handleSubmit((values) => {
    forgotMutation.mutate(values.email, {
      onSuccess: () => {
        setSubmittedEmail(values.email);
      },
      onError: (error) => {
        if (error.status === HTTP_STATUS.BAD_REQUEST) setSubmittedEmail(values.email);
      },
    });
  });
  const visibleError =
    forgotMutation.error?.status === HTTP_STATUS.BAD_REQUEST ? null : forgotMutation.error;

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
                forgotMutation.reset();
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
        <ApiErrorAlert error={visibleError} />
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
        <Button
          type="submit"
          size="lg"
          fullWidth
          iconStart={<Sparkles aria-hidden="true" />}
          isLoading={forgotMutation.isPending}
        >
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
