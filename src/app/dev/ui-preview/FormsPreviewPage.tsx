import { Mail, User } from 'lucide-react';

import { PageHeader } from '@/components/shared/PageHeader';
import { SearchField } from '@/components/shared/SearchField';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox, FormField, Input, PasswordInput, Select, Textarea } from '@/components/ui/Field';

import styles from './preview.module.css';

export function FormsPreviewPage() {
  return (
    <div className={styles.page}>
      <PageHeader title="عناصر النماذج" subtitle="حقول مرتبطة بتسمياتها ورسائل الأخطاء." />
      <Card>
        <form
          className={styles.formGrid}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <FormField label="الاسم الكامل" isRequired>
            {(field) => <Input {...field} leadingIcon={<User />} placeholder="مثال: محمد أحمد" />}
          </FormField>
          <FormField label="البريد الإلكتروني" hint="سيُستخدم لتسجيل الدخول.">
            {(field) => <Input {...field} type="email" leadingIcon={<Mail />} />}
          </FormField>
          <FormField label="كلمة المرور" error="يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.">
            {(field) => <PasswordInput {...field} />}
          </FormField>
          <div className={styles.formRow}>
            <FormField label="الجنس">
              {(field) => (
                <Select {...field} defaultValue="">
                  <option value="" disabled>
                    اختر…
                  </option>
                  <option value="a">خيار أ</option>
                  <option value="b">خيار ب</option>
                </Select>
              )}
            </FormField>
            <FormField label="تاريخ">{(field) => <Input {...field} type="date" />}</FormField>
          </div>
          <FormField label="ملاحظات">
            {(field) => <Textarea {...field} placeholder="اكتب هنا…" />}
          </FormField>
          <Checkbox label="تذكّرني على هذا الجهاز" />
          <SearchField label="بحث" placeholder="ابحث…" />
          <Button type="submit" fullWidth size="lg">
            حفظ (معاينة)
          </Button>
        </form>
      </Card>
    </div>
  );
}
