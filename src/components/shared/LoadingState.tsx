import { StatusMessage } from '@/components/shared/StatusMessage';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'جارٍ التحميل…' }: LoadingStateProps) {
  return <StatusMessage variant="loading" role="status" title={label} />;
}
