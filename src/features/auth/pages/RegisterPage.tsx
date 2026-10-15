import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Mail, Sparkles, User, Users } from 'lucide-react';
import { useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { FormField, Input, PasswordInput } from '@/components/ui/Field';
import { ROLE_LABELS } from '@/constants/roleLabels';
import { ROUTE_PATHS } from '@/constants/routes';

import { AuthCard } from '../components/AuthCard';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { useRegisterMutation } from '../api/authMutations';
import { registerSchema, type RegisterFormValues } from '../schemas/register';

import styles from './AuthForm.module.css';

const COPY = {
  title: 'إنشاء حساب جديد',
  subtitle: 'انضم إلينا لمساعدة طفلك في رحلة التعلم',
  accountType: 'نوع الحساب',
  accountTypeHint: 'لمتابعة طفلك',
  parentsOnly: 'التسجيل العام متاح لأولياء الأمور فقط.',
  fullName: 'الاسم الكامل',
  fullNamePlaceholder: 'مثال: محمد أحمد',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirmPassword: 'تأكيد كلمة المرور',
  submit: 'إنشاء حساب',
  hasAccount: 'لديك حساب بالفعل؟',
  login: 'تسجيل الدخول',
  created:
    'تم إنشاء الحساب. سجّل الدخول للمتابعة — وإذا وصلتك رسالة تأكيد على بريدك فأكّد حسابك أولاً.',
  goToLogin: 'الانتقال إلى تسجيل الدخول',
} as const;

/**
 * Parent self-registration. Replit showed three role cards (parent/teacher/specialist);
 * only the parent account is publicly available, so it is shown as a fixed account type.
 */
export function RegisterPage() {
  const registerMutation = useRegisterMutation();
  const accountTypeId = useId();
  const strengthId = useId();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  return (
    <AuthCard
      size="wide"
      title={COPY.title}
      subtitle={COPY.subtitle}
      footer={
        <>
          {COPY.hasAccount}{' '}
          <Link to={ROUTE_PATHS.login} className={styles.inlineLink}>
            {COPY.login}
          </Link>
        </>
      }
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        {registerMutation.isSuccess ? (
          <Alert tone="success">
            {COPY.created}{' '}
            <Link
              to={ROUTE_PATHS.login}
              className={getButtonClassName({ variant: 'ghost', size: 'sm' })}
            >
              {COPY.goToLogin}
            </Link>
          </Alert>
        ) : null}
        <ApiErrorAlert error={registerMutation.error} />

        <div className={styles.fieldGroup} role="group" aria-labelledby={accountTypeId}>
          <p id={accountTypeId} className={styles.accountTypeName}>
            {COPY.accountType}
          </p>
          <div className={styles.accountType}>
            <span className={styles.accountTypeIcon} aria-hidden="true">
              <Users />
            </span>
            <div>
              <p className={styles.accountTypeName}>{ROLE_LABELS.Parent}</p>
              <p className={styles.accountTypeHint}>
                {COPY.accountTypeHint} — {COPY.parentsOnly}
              </p>
            </div>
          </div>
        </div>

        <FormField label={COPY.fullName} error={errors.fullName?.message}>
          {(field) => (
            <Input
              {...field}
              {...register('fullName')}
              autoComplete="name"
              placeholder={COPY.fullNamePlaceholder}
              leadingIcon={<User />}
              inputSize="lg"
            />
          )}
        </FormField>
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
        <Button
          type="submit"
          size="lg"
          fullWidth
          className={styles.submit}
          iconStart={<Sparkles aria-hidden="true" />}
          isLoading={registerMutation.isPending}
          disabled={registerMutation.isSuccess}
        >
          {COPY.submit}
        </Button>
      </form>
    </AuthCard>
  );
}
