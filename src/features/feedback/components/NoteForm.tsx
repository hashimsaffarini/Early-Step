import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FormField, Textarea } from '@/components/ui/Field';

import { noteSchema, type NoteFormValues } from '../schemas/note';

import styles from './notes.module.css';

export interface NoteFormProps {
  label: string;
  submitLabel: string;
  initialContent?: string;
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<unknown>;
  onCancel?: () => void;
}

/** Note text with Arabic validation. Resets after a successful submit. */
export function NoteForm({
  label,
  submitLabel,
  initialContent = '',
  isSubmitting,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: initialContent },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values.content);
      reset({ content: '' });
    } catch {
      // The error is shown by the caller (mutation state); keep the text for another try.
    }
  });

  return (
    <form className={styles.form} noValidate onSubmit={(event) => void submit(event)}>
      <FormField label={label} error={errors.content?.message} isRequired>
        {(field) => <Textarea {...field} {...register('content')} rows={4} />}
      </FormField>
      <div className={styles.formActions}>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            إلغاء
          </Button>
        ) : null}
      </div>
    </form>
  );
}
