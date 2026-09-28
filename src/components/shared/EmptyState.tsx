import { Inbox } from 'lucide-react';

import { StatusMessage, type StatusMessageProps } from '@/components/shared/StatusMessage';

export function EmptyState({ icon = <Inbox />, ...props }: StatusMessageProps) {
  return <StatusMessage variant="empty" icon={icon} {...props} />;
}
