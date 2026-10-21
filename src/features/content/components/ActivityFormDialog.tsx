import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import {
  buildGameSlug,
  GAME_TEMPLATE_LIST,
  GAME_TEMPLATES,
  gameSlugSuffix,
  resolveGameTemplate,
  type GameSlug,
} from '@/components/games';
import { CHOICE_TYPE_LABELS } from '@/components/players';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { ActivityType } from '@/services/api/activityType';

import { useSaveActivity } from '../api/contentQueries';
import { activitySchema, type ActivityFormValues } from '../schemas/contentForms';
import { ACTIVITY_TYPE_LABELS, ADD_LABELS, type ActivitySummary, type Category } from '../types';

import styles from './content.module.css';
import { ImageField } from './ImageField';

export interface ActivityFormDialogProps {
  type: ActivityType;
  /** `null` = create. Mounted only while open. */
  activity: ActivitySummary | null;
  categories: readonly Category[];
  /** Games: the template chosen from «قوالب الألعاب» before opening the form. */
  initialTemplate?: GameSlug | undefined;
  onClose: () => void;
}

/** A game's template from its current slug (edit) or the one picked before opening (create). */
function startingTemplate(
  activity: ActivitySummary | null,
  initialTemplate: GameSlug | undefined,
): GameSlug | '' {
  return resolveGameTemplate(activity?.slug)?.slug ?? initialTemplate ?? '';
}

/**
 * Create/edit an activity (multipart: Title, Description, Slug, CategoryId, Icon). Games also get
 * «نوع اللعبة» (client revision 2026-10): the template is saved in the backend `Slug` — the template
 * slug itself (`letter-hunt`) or with a suffix (`letter-hunt-2`) when several games share it.
 * Existing questions are never changed; the detail page shows which ones fit the template.
 */
export function ActivityFormDialog({
  type,
  activity,
  categories,
  initialTemplate,
  onClose,
}: ActivityFormDialogProps) {
  const saveMutation = useSaveActivity();
  const isGame = type === 'game';
  const [templateSlug, setTemplateSlug] = useState<GameSlug | ''>(() =>
    isGame ? startingTemplate(activity, initialTemplate) : '',
  );
  const template = templateSlug ? GAME_TEMPLATES[templateSlug] : null;
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: activity?.title ?? '',
      description: activity?.description ?? '',
      slug: activity?.slug ?? (templateSlug || ''),
      categoryId: activity?.categoryId ?? '',
      icon: null,
    },
  });

  const chooseTemplate = (next: GameSlug | '') => {
    const current = getValues('slug');
    const suffix = templateSlug ? gameSlugSuffix(current, templateSlug) : '';
    setTemplateSlug(next);
    if (next) setValue('slug', buildGameSlug(next, suffix), { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    if (template && resolveGameTemplate(values.slug)?.slug !== template.slug) {
      setError('slug', {
        message: `يجب أن يبدأ المعرّف بـ ${template.slug} ليفتح الطفل لعبة «${template.name}».`,
      });
      return;
    }
    saveMutation.mutate({ type, id: activity?.id ?? null, input: values }, { onSuccess: onClose });
  });

  const typeLabel = ACTIVITY_TYPE_LABELS[type];
  return (
    <Modal
      isOpen
      onClose={onClose}
      size="lg"
      title={activity ? 'تعديل النشاط' : ADD_LABELS[type]}
      description={`النوع: ${typeLabel}`}
    >
      <form className={styles.form} noValidate onSubmit={(event) => void onSubmit(event)}>
        <ApiErrorAlert error={saveMutation.error} />
        <FormField label="عنوان النشاط" error={errors.title?.message} isRequired>
          {(field) => <Input {...field} {...register('title')} autoComplete="off" />}
        </FormField>
        <FormField label="الوصف" error={errors.description?.message}>
          {(field) => <Textarea {...field} {...register('description')} rows={3} />}
        </FormField>
        {isGame ? (
          <div className={styles.templatePicker}>
            <FormField
              label="نوع اللعبة"
              hint="يحدّد واجهة اللعب التي يراها الطفل. الأسئلة تبقى من محتوى هذا النشاط."
            >
              {(field) => (
                <Select
                  {...field}
                  value={templateSlug}
                  onChange={(event) => {
                    chooseTemplate(resolveGameTemplate(event.target.value)?.slug ?? '');
                  }}
                >
                  <option value="">بدون قالب (المشغّل العام)</option>
                  {GAME_TEMPLATE_LIST.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
            {template ? (
              <div className={styles.templateInfo} role="status">
                <span className={styles.templateIcon} aria-hidden="true">
                  <template.icon />
                </span>
                <div className={styles.rowMain}>
                  <p className={styles.rowTitle}>{`${template.name} — ${template.purpose}`}</p>
                  <p className={styles.muted}>{template.description}</p>
                  <p className={styles.muted}>
                    {`أنواع الأسئلة المناسبة: ${template.questionTypes
                      .map((questionType) => CHOICE_TYPE_LABELS[questionType])
                      .join('، ')}. الأسئلة من نوع آخر تُعرض بالواجهة المناسبة لنوعها.`}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className={styles.twoColumns}>
          <FormField
            label="المعرّف المختصر (Slug)"
            hint={
              template
                ? `يبدأ بـ ${template.slug}؛ أضف لاحقة عند تكرار القالب، مثل: ${template.slug}-2`
                : 'أحرف إنجليزية صغيرة وأرقام وشرطات، مثل: letters-test'
            }
            error={errors.slug?.message}
            isRequired
          >
            {(field) => <Input {...field} {...register('slug')} dir="ltr" autoComplete="off" />}
          </FormField>
          <FormField label="التصنيف" error={errors.categoryId?.message} isRequired>
            {(field) => (
              <Select {...field} {...register('categoryId')}>
                <option value="" disabled>
                  اختر…
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            )}
          </FormField>
        </div>
        <Controller
          control={control}
          name="icon"
          render={({ field, fieldState }) => (
            <ImageField
              label="أيقونة النشاط"
              hint={activity ? 'اترك الحقل فارغاً للإبقاء على الأيقونة الحالية.' : 'اختيارية.'}
              value={field.value}
              onChange={field.onChange}
              existingPath={activity?.iconUrl}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          fullWidth
          isLoading={saveMutation.isPending}
          iconStart={<Save aria-hidden="true" />}
        >
          حفظ
        </Button>
      </form>
    </Modal>
  );
}
