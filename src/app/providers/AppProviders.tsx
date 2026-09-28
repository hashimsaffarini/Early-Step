import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { createQueryClient } from '@/app/providers/queryClient';
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Single place where global providers are composed.
 * Future providers (auth session, toasts, ...) are added here — not in main.tsx.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AppErrorBoundary>
  );
}
