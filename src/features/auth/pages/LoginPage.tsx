import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { Checkbox, FormField, Input, PasswordInput } from '@/components/ui/Field';
import { ROUTE_PATHS } from '@/constants/routes';

import { AuthCard } from '../components/AuthCard';
import { UI_ONLY_NOTICE } from '../constants';
import { loginSchema, type LoginFormValues } from '../schemas/login';

import styles from './AuthForm.module.css';

const COPY = {
  title: 'أهلاً بعودتك!',
  subtitle: 'سجّل دخولك لمتابعة رحلة طفلك',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  forgot: 'نسيت كلمة المرور؟',
  remember: 'تذكّرني على هذا الجهاز',
  submit: 'دخول',
  noAccount: 'ليس لديك حساب؟',
  register: 'سجل الآن',
  validated: 'تم التحقق من صحة البيانات.',
} as const;

export function LoginPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  // UI-only stage: validation succeeds locally, no request is sent (no backend auth yet).
  const onSubmit = handleSubmit(() => {
    setIsSubmitted(true);
  });

  return (
    <AuthCard
      title={COPY.title}
      subtitle={COPY.subtitle}
      footer={
        <>
          {COPY.noAccount}{' '}
          <Link to={ROUTE_PATHS.register} className={styles.inlineLink}>
            {COPY.register}
          </Link>
        </>
      }
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        {isSubmitted ? (
          <Alert tone="info">
            {COPY.validated} {UI_ONLY_NOTICE}
          </Alert>
        ) : null}
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
        <FormField
          label={COPY.password}
          error={errors.password?.message}
          labelAction={
            <Link to={ROUTE_PATHS.forgotPassword} className={styles.labelLink}>
              {COPY.forgot}
            </Link>
          }
        >
          {(field) => (
            <PasswordInput
              {...field}
              {...register('password')}
              autoComplete="current-password"
              leadingIcon={<Lock />}
              inputSize="lg"
            />
          )}
        </FormField>
        <Checkbox label={COPY.remember} {...register('rememberMe')} />
        <Button
          type="submit"
          size="lg"
          fullWidth
          className={styles.submit}
          iconStart={<Sparkles aria-hidden="true" />}
        >
          {COPY.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
