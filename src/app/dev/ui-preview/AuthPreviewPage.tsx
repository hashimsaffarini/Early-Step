import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField, Input, PasswordInput } from '@/components/ui/Field';

import styles from './preview.module.css';

/** Visual preview of the auth card layout — no authentication logic. */
export function AuthPreviewPage() {
  return (
    <div className={styles.stack}>
      <div>
        <h1>أهلاً بعودتك!</h1>
        <p className={styles.muted}>معاينة تخطيط صفحات الدخول فقط.</p>
      </div>
      <form
        className={styles.stack}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <FormField label="البريد الإلكتروني">
          {(field) => <Input {...field} type="email" leadingIcon={<Mail />} inputSize="lg" />}
        </FormField>
        <FormField label="كلمة المرور">
          {(field) => <PasswordInput {...field} inputSize="lg" />}
        </FormField>
        <Button type="submit" size="lg" fullWidth>
          دخول (معاينة)
        </Button>
      </form>
    </div>
  );
}
