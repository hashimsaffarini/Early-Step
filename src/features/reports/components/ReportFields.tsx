import type { UseFormRegisterReturn } from 'react-hook-form';

import { Card } from '@/components/ui/Card';
import { FormField, Input, Textarea } from '@/components/ui/Field';
import { cx } from '@/utils/classNames';

import styles from './ReportFields.module.css';

const LINES_HINT = 'اكتب كل ملاحظة في سطر منفصل.';

type ReportFieldName = 'title' | 'weaknesses' | 'recommendations';

export interface ReportFieldsProps {
  /** `register('title')` etc. from the page's form. */
  fields: Record<ReportFieldName, UseFormRegisterReturn>;
  errors: Partial<Record<ReportFieldName, string | undefined>>;
}

/** The report's real fields: title, weaknesses ("جوانب تحتاج إلى دعم"), recommendations. */
export function ReportFields({ fields, errors }: ReportFieldsProps) {
  return (
    <>
      <Card className={styles.card}>
        <FormField label="عنوان التقرير" error={errors.title} isRequired>
          {(field) => <Input {...field} {...fields.title} placeholder="مثال: تقرير متابعة شهري" />}
        </FormField>
      </Card>
      <Card className={cx(styles.card, styles.warning)}>
        <FormField
          label="جوانب تحتاج إلى دعم"
          hint={LINES_HINT}
          error={errors.weaknesses}
          isRequired
        >
          {(field) => (
            <Textarea
              {...field}
              {...fields.weaknesses}
              rows={4}
              placeholder="صف الجوانب التي تحتاج إلى دعم إضافي…"
            />
          )}
        </FormField>
      </Card>
      <Card className={cx(styles.card, styles.violet)}>
        <FormField label="التوصيات" hint={LINES_HINT} error={errors.recommendations} isRequired>
          {(field) => (
            <Textarea
              {...field}
              {...fields.recommendations}
              rows={4}
              placeholder="اكتب توصياتك للأسرة والمعلم خطوة بخطوة…"
            />
          )}
        </FormField>
      </Card>
    </>
  );
}
