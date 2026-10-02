import { ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router';

import { getButtonClassName, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';
import { useRoleArea } from '@/hooks/useRoleArea';

export interface StartAssessmentLinkProps {
  childId: string;
  childName: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Opens the full-screen initial assessment for this child (Replit "ابدأ التقييم الأولي"). */
export function StartAssessmentLink({
  childId,
  childName,
  variant,
  size,
}: StartAssessmentLinkProps) {
  const { paths } = useRoleArea();
  return (
    <Link
      to={paths.assessment(childId)}
      className={getButtonClassName({ variant, size })}
      aria-label={`بدء التقييم المبدئي لـ ${childName}`}
    >
      <ClipboardCheck aria-hidden="true" />
      بدء التقييم
    </Link>
  );
}
