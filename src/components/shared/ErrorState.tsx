import { TriangleAlert } from 'lucide-react';

import { StatusMessage, type StatusMessageProps } from '@/components/shared/StatusMessage';

export function ErrorState({ icon = <TriangleAlert />, ...props }: StatusMessageProps) {
  return <StatusMessage variant="error" role="alert" icon={icon} {...props} />;
}
