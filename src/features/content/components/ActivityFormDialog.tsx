import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { REAL_GAME_LIST, resolveGameTemplate, resolveRealGame } from '@/components/games';

import { ApiErrorAlert } from '@/components/shared/ApiErrorAlert';
import { Button } from '@/components/ui/Button';
import { FormField, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { ActivityType } from '@/services/api/activityType';

import { useSaveActivity } from '../api/contentQueries';
import { activitySchema, type ActivityFormValues } from '../schemas/contentForms';
import { ACTIVITY_TYPE_LABELS, ADD_LABELS, type ActivitySummary, type Category } from '../types';

import styles from './content.module.css';
import { GameTypePicker, type GameTypeOption } from './GameTypePicker';
import { ImageField } from './ImageField';

export interface ActivityFormDialogProps {
  type: ActivityType;
  /** `null` = create. Mounted only while open. */
  activity: ActivitySummary | null;
  categories: readonly Category[];
  /** Games: the real game chosen from «قوالب الألعاب» before opening the form. */
  initialTemplate?: string | undefined;
  onClose: () => void;
}

const REAL_GAME_OPTIONS: readonly GameTypeOption[] = REAL_GAME_LIST.map((game) => ({
  slug: game.slug,
  name: game.name,
  description: game.tagline,
  skill: game.skill,
  icon: game.icon,
}));

/** The game type a saved slug names: one of the five real games, else a legacy template. */
function savedGameType(slug: string | null | undefined): GameTypeOption | null {
  const real = resolveRealGame(slug);
  if (real) return REAL_GAME_OPTIONS.find((option) => option.slug === real.slug) ?? null;
  const legacy = resolveGameTemplate(slug);
  if (!legacy) return null;
  return {
    slug: legacy.slug,
    name: legacy.name,
    description: legacy.description,
    skill: legacy.purpose,
    icon: legacy.icon,
    isLegacy: true,
  };
}

function slugSuffix(slug: string, base: string): string {
  return slug.startsWith(`${base}-`) ? slug.slice(base.length + 1) : '';
}

function withSuffix(base: string, suffix: string): string {
  const clean = suffix.trim().toLowerCase();
  return clean ? `${base}-${clean}` : base;
}

/**
 * Create/edit an activity (multipart: Title, Description, Slug, CategoryId, Icon). Games also get
 * «نوع اللعبة» as visual cards (client revision 2026-11): new games use one of the five real
 * games; an activity saved with an older template keeps it as an extra card (backward compatible).
 * The type is saved in the backend `Slug` — the game slug itself (`memory-pairs`) or with a
 * suffix (`memory-pairs-2`) when several activities share it. Questions are never changed.
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
  const saved = isGame ? savedGameType(activity?.slug) : null;
  const options = saved?.isLegacy ? [...REAL_GAME_OPTIONS, saved] : REAL_GAME_OPTIONS;
  const [templateSlug, setTemplateSlug] = useState<string>(() => {
    if (!isGame) return '';
    return saved?.slug ?? savedGameType(initialTemplate)?.slug ?? '';
  });
  const template = options.find((option) => option.slug === templateSlug) ?? null;
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

  const chooseTemplate = (next: string) => {
    const current = getValues('slug');
    const suffix = templateSlug ? slugSuffix(current, templateSlug) : '';
    setTemplateSlug(next);
    if (next) setValue('slug', withSuffix(next, suffix), { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    if (template && savedGameType(values.slug)?.slug !== template.slug) {
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
            <GameTypePicker options={options} value={templateSlug} onChange={chooseTemplate} />
            {template && !template.isLegacy ? (
              <p className={styles.muted} role="status">
                {`«${template.name}» لعبة جاهزة بمحتوى ومستويات (سهل / متوسط / صعب) من التطبيق، ولا تحتاج إلى أسئلة.`}
              </p>
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
              mediaKey={`activity:${type}:${activity?.id ?? ''}`}
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
