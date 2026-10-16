import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { FormField, Input } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';

import { useForgotPasswordMutation } from '../api/authMutations';
import { AuthCard } from '../components/AuthCard';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/passwordRecovery';
import type { ResetPasswordLocationState } from './ResetPasswordPage';

import styles from './AuthForm.module.css';

const COPY = {
  title: 'نسيت كلمة المرور؟',
  subtitle: 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور',
  email: 'البريد الإلكتروني',
  submit: 'إرسال رمز التحقق',
  rememberIt: 'تذكرت كلمة المرور؟',
  login: 'تسجيل الدخول',
  successTitle: 'تم استلام طلبك',
  successText: 'إذا كان البريد الإلكتروني مسجلاً، فسيتم إرسال تعليمات استعادة كلمة المرور.',
  enterCode: 'إدخال رمز التحقق',
} as const;

function LoginFooter() {
  return (
    <>
      {COPY.rememberIt}{' '}
      <Link to={ROUTE_PATHS.login} className={styles.inlineLink}>
        {COPY.login}
      </Link>
    </>
  );
}

/**
 * Forgot password — a single centred card like the login page (client revision 2026-10: no side
 * panel). `POST Auth/ForgotPassword` answers the same neutral 200 for known and unknown emails, so
 * the confirmation does not reveal which emails have accounts.
 */
export function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const forgotMutation = useForgotPasswordMutation();

  const onSubmit = handleSubmit((values) => {
    forgotMutation.mutate(values.email, {
      onSuccess: () => {
        setSubmittedEmail(values.email);
      },
    });
  });

  if (submittedEmail !== null) {
    const resetState: ResetPasswordLocationState = { email: submittedEmail };
    return (
      <AuthCard title={COPY.successTitle} subtitle={COPY.successText} footer={<LoginFooter />}>
        <div className={styles.success} role="status">
          <span className={styles.successIcon} aria-hidden="true">
            <MailCheck />
          </span>
          <Link
            to={ROUTE_PATHS.resetPassword}
            state={resetState}
            className={getButtonClassName({ size: 'lg', fullWidth: true })}
          >
            {COPY.enterCode}
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={COPY.title} subtitle={COPY.subtitle} footer={<LoginFooter />}>
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={forgotMutation.error} />
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
    </AuthCard>
  );
}
