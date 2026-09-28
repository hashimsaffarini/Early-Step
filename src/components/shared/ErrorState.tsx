import { StatusMessage, type StatusMessageProps } from '@/components/shared/StatusMessage';

export function ErrorState(props: StatusMessageProps) {
  return <StatusMessage variant="error" role="alert" {...props} />;
}
