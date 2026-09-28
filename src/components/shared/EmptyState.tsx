import { StatusMessage, type StatusMessageProps } from '@/components/shared/StatusMessage';

export function EmptyState(props: StatusMessageProps) {
  return <StatusMessage variant="empty" {...props} />;
}
