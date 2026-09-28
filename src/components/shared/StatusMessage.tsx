import type { ReactNode } from 'react';

export interface StatusMessageProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

interface BaseProps extends StatusMessageProps {
  role?: 'status' | 'alert';
  variant: 'empty' | 'error' | 'loading';
}

/** Shared markup for loading / empty / error states. Styling is intentionally neutral. */
export function StatusMessage({ title, description, action, role, variant }: BaseProps) {
  return (
    <div className="status-message stack" data-variant={variant} role={role}>
      <p className="status-message__title">{title}</p>
      {description ? <p className="status-message__description">{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
