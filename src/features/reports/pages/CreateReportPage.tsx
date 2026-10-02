import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, CircleAlert, CircleCheck, Send, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

import { PageHeader } from '@/components/shared/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Button, getButtonClassName } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Select, Textarea } from '@/components/ui/Field';
import { useRoleArea } from '@/hooks/useRoleArea';
import { cx } from '@/utils/classNames';

import { REPORT_TYPE_LABELS, REPORT_TYPES } from '../constants';
import { getReportChildOptions, MOCK_REPORT_AUTHORS } from '../mock/reports.mock';
import {
  createReportSchema,
  type CreateReportFormInput,
  type CreateReportFormValues,
} from '../schemas/createReport';

import styles from './CreateReportPage.module.css';

const EMPTY_VALUES: CreateReportFormInput = {
  childId: '',
  type: '',
  strengths: '',
  areasToSupport: '',
  recommendations: '',
};

const LINES_HINT = 'اكتب كل ملاحظة في سطر منفصل.';

type TextSectionName = 'strengths' | 'areasToSupport' | 'recommendations';

const TEXT_SECTIONS: readonly {
  name: TextSectionName;
  label: string;
  placeholder: string;
  tone: 'success' | 'warning' | 'violet';
}[] = [
  {
    name: 'strengths',
    label: 'نقاط القوة',
    placeholder: 'صف المهارات التي أبدى الطفل تقدّماً فيها…',
    tone: 'success',
  },
  {
    name: 'areasToSupport',
    label: 'جوانب تحتاج إلى دعم',
    placeholder: 'صف الجوانب التي تحتاج إلى دعم إضافي…',
    tone: 'warning',
  },
  {
    name: 'recommendations',
    label: 'التوصيات',
    placeholder: 'اكتب توصياتك للأسرة والمعلم خطوة بخطوة…',
    tone: 'violet',
  },
];

/** Success panel shown after a local "save" (nothing is sent anywhere). */
function SavedState({
  onWriteAnother,
  reportsPath,
}: {
  onWriteAnother: () => void;
  reportsPath: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <Card className={styles.done}>
      <CircleCheck className={styles.doneIcon} aria-hidden="true" />
      <h2 ref={titleRef} tabIndex={-1} className={styles.doneTitle}>
        تم حفظ التقرير!
      </h2>
      <p className={styles.doneText}>تم حفظ التقرير محلياً للعرض فقط — لم يُرسل إلى أي جهة.</p>
      <div className={styles.doneActions}>
        <Link to={reportsPath} className={getButtonClassName()}>
          عرض جميع التقارير
        </Link>
        <Button variant="outline" onClick={onWriteAnother}>
          كتابة تقرير آخر
        </Button>
      </div>
    </Card>
  );
}

/**
 * Replit "إنشاء تقرير جديد" — manual entry only. The AI mode and the probability slider are
 * intentionally not migrated. UI only: submitting keeps the report in local state.
 */
export function CreateReportPage() {
  const { role, paths } = useRoleArea();
  const [isSaved, setIsSaved] = useState(false);
  const children = getReportChildOptions(role);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReportFormInput, unknown, CreateReportFormValues>({
    resolver: zodResolver(createReportSchema),
    defaultValues: EMPTY_VALUES,
  });

  const onSubmit = handleSubmit(() => {
    setIsSaved(true);
  });

  const writeAnother = () => {
    reset(EMPTY_VALUES);
    setIsSaved(false);
  };

  const childError = errors.childId?.message;

  return (
    <div className={styles.page}>
      <Link to={paths.reports} className={styles.backLink}>
        <ArrowRight aria-hidden="true" />
        العودة إلى التقارير
      </Link>
      <PageHeader title="إنشاء تقرير جديد" subtitle={`بقلم: ${MOCK_REPORT_AUTHORS[role]}`} />

      {isSaved ? (
        <SavedState onWriteAnother={writeAnother} reportsPath={paths.reports} />
      ) : (
        <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
          <Card className={styles.card}>
            <fieldset
              className={styles.fieldset}
              aria-describedby={childError ? 'report-child-error' : undefined}
            >
              <legend className={styles.legend}>
                <UserRound aria-hidden="true" />
                اختر الطفل
              </legend>
              <div className={styles.children}>
                {children.map((child) => (
                  <label key={child.id} className={styles.childOption}>
                    <input
                      type="radio"
                      value={child.id}
                      className={styles.radio}
                      {...register('childId')}
                    />
                    <Avatar name={child.name} shape="circle" />
                    {child.name}
                    <Check className={styles.check} aria-hidden="true" />
                  </label>
                ))}
              </div>
              {childError ? (
                <p id="report-child-error" className={styles.error}>
                  <CircleAlert aria-hidden="true" />
                  {childError}
                </p>
              ) : null}
            </fieldset>

            <FormField label="نوع التقرير" error={errors.type?.message} isRequired>
              {(field) => (
                <Select {...field} {...register('type')}>
                  <option value="">اختر…</option>
                  {REPORT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {REPORT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </Card>

          {TEXT_SECTIONS.map((section) => (
            <Card key={section.name} className={cx(styles.card, styles[section.tone])}>
              <FormField
                label={section.label}
                hint={LINES_HINT}
                error={errors[section.name]?.message}
                isRequired
              >
                {(field) => (
                  <Textarea
                    {...field}
                    {...register(section.name)}
                    rows={4}
                    placeholder={section.placeholder}
                  />
                )}
              </FormField>
            </Card>
          ))}

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            iconStart={<Send aria-hidden="true" />}
          >
            حفظ التقرير
          </Button>
        </form>
      )}
    </div>
  );
}
