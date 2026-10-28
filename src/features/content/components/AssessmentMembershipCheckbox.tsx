import { useEffect, useRef } from 'react';
import { Checkbox } from '@/components/ui/Field';

/** Mixed means unknown/partial; never presents an unread server state as confirmed false. */
export function AssessmentMembershipCheckbox({
  label,
  value,
  disabled,
  onChange,
  compact = false,
}: {
  label: string;
  compact?: boolean;
  value: boolean | null;
  disabled?: boolean;
  onChange: (include: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = value === null;
  }, [value]);
  return (
    <Checkbox
      ref={ref}
      label={compact ? <span className="visually-hidden">{label}</span> : label}
      checked={value ?? false}
      aria-checked={value ?? 'mixed'}
      disabled={disabled}
      title={
        value === null
          ? 'الحالة السابقة غير مؤكدة؛ اختر لإضافة الأسئلة.'
          : 'آخر إجراء محفوظ على هذا المتصفح.'
      }
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
  );
}
